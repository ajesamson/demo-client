import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { KnexService } from 'src/knex/knex.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { Knex } from 'knex';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';
import { TransfersService } from 'src/transfers/transfers.service';
import { Transaction } from './entities/transaction.entity';
import { plainToInstance } from 'class-transformer';
import { TransactionResponseDto } from './dto/trasaction-response.dto';
import { WalletUser } from 'src/wallets/entities/wallet-user.entity';

@Injectable()
export class TransactionsService {
  private readonly dbTable = 'transactions';
  constructor(
    private readonly knexService: KnexService,
    private readonly walletService: WalletsService,
    private readonly transfersService: TransfersService,
  ) {}

  async create(
    dto: CreateTransactionDto,
    userId: number,
  ): Promise<TransactionResponseDto | undefined> {
    // NOTE: only debit transaction would have a receiver_wallet_id
    if (dto.type == TransactionTypesEnum.CREDIT && dto.receiver_wallet_id) {
      throw new BadRequestException('Invalid transaction type', {
        cause: new Error(),
        description: 'Receiver was specified for a credit transaction',
      });
    }
    try {
      const newTransactionData = await this.knexService.connection.transaction(
        async (trx: Knex.Transaction) => {
          // get sender wallet and receiver wallets
          const walletUidList = [dto.wallet_id];
          if (dto.receiver_wallet_id) {
            walletUidList.push(dto.receiver_wallet_id);
          }
          const [senderWallet, receiverWallet] = await this.retrieveWallets(
            trx,
            walletUidList,
          );

          // create transfer if present
          let transferId = 0;
          if (receiverWallet != undefined) {
            transferId = await this.initiateTransfer(
              trx,
              senderWallet,
              receiverWallet,
              dto,
            );
          }

          // create transaction
          const transactionId = await this.initiateTransaction(
            trx,
            userId,
            dto,
            senderWallet,
            receiverWallet,
            transferId,
          );

          // update wallet
          await this.initiateWalletUpdate(
            trx,
            senderWallet,
            receiverWallet,
            dto,
          );

          return await trx<Transaction>(this.dbTable)
            .where({ id: transactionId })
            .first();
        },
      );

      return plainToInstance(TransactionResponseDto, newTransactionData, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async initiateWalletUpdate(
    trx: Knex,
    senderWallet: WalletUser,
    receiverWallet: WalletUser | undefined,
    dto: CreateTransactionDto,
  ) {
    await this.walletService.updateBalance(
      trx,
      senderWallet.id,
      dto.amount,
      dto.type,
    );
    if (receiverWallet != undefined) {
      await this.walletService.updateBalance(
        trx,
        receiverWallet.id,
        dto.amount,
        TransactionTypesEnum.CREDIT,
      );
    }
  }

  async initiateTransaction(
    trx: Knex,
    userId: number,
    dto: CreateTransactionDto,
    senderWallet: WalletUser,
    receiverWallet: WalletUser | undefined,
    transferId: number,
  ): Promise<number> {
    const newTransaction = [
      {
        wallet_id: senderWallet.id,
        transfer_id: transferId > 0 ? transferId : null,
        initiated_by: userId,
        type: dto.type,
        amount: dto.amount,
        description: dto.description ?? '',
        reference: dto.reference ?? '',
      },
    ];
    if (transferId && receiverWallet != undefined) {
      newTransaction.push({
        wallet_id: receiverWallet.id,
        transfer_id: transferId > 0 ? transferId : null,
        initiated_by: userId,
        type: TransactionTypesEnum.CREDIT,
        amount: dto.amount,
        description: dto.description ?? '',
        reference: dto.reference ?? '',
      });
    }

    const [transactionId] = await trx(this.dbTable).insert(newTransaction);
    return transactionId;
  }

  async initiateTransfer(
    trx: Knex,
    senderWallet: WalletUser,
    receiverWallet: WalletUser,
    dto: CreateTransactionDto,
  ): Promise<number> {
    const data = {
      sender_wallet_id: senderWallet.id,
      receiver_wallet_id: receiverWallet.id,
      amount: dto.amount,
      currency: senderWallet.currency,
      description: dto.description ?? '',
    };
    return await this.transfersService.create(trx, data);
  }

  async retrieveWallets(
    trx: Knex,
    uidList: string[],
  ): Promise<[WalletUser, WalletUser | undefined]> {
    const wallets = await this.walletService.findByUidList(uidList, trx);
    const senderWallet =
      wallets[0].uid === uidList[0] ? wallets[0] : wallets[1];
    let receiverWallet;
    if (uidList.length == 2) {
      receiverWallet = wallets[0].uid === uidList[1] ? wallets[0] : wallets[1];
    }
    this.confirmWalletStatus(senderWallet, receiverWallet);

    return [senderWallet, receiverWallet];
  }

  confirmWalletStatus(
    senderWallet: WalletUser,
    receiverWallet: WalletUser | undefined,
  ) {
    if (
      !senderWallet.isWalletActive ||
      !senderWallet.isUserActive ||
      !senderWallet.isUserOnboarded
    ) {
      throw new BadRequestException('Invalid sender status', {
        description:
          'Sender is likely in-active, not onboarded or have a disabled wallet',
      });
    }
    if (
      receiverWallet != undefined &&
      (!receiverWallet.isWalletActive ||
        !receiverWallet.isUserActive ||
        !receiverWallet.isUserOnboarded)
    ) {
      throw new BadRequestException('Invalid receiver status', {
        description:
          'Receiver is likely in-active, not onboarded or have a disabled wallet',
      });
    }
  }

  async findAll(): Promise<TransactionResponseDto[]> {
    const data = await this.knexService
      .connection<Transaction>(this.dbTable)
      .select();

    return plainToInstance(TransactionResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string): Promise<TransactionResponseDto> {
    const data = await this.findByUid(uid);

    if (!data) {
      throw new NotFoundException('Transaction not found', {
        cause: new Error(),
        description: `Transaction with id ${uid} not found`,
      });
    }

    return plainToInstance(TransactionResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<Transaction | undefined> {
    return await this.knexService
      .connection<Transaction>(this.dbTable)
      .where({ id })
      .first();
  }

  async findByUid(uid: string): Promise<Transaction | undefined> {
    return await this.knexService
      .connection<Transaction>(this.dbTable)
      .where({ uid })
      .first();
  }

  async update(
    uid: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const affectedRow = await this.knexService
      .connection<Transaction>(this.dbTable)
      .where({ uid })
      .update(dto);

    if (!affectedRow) {
      throw new NotFoundException('Transaction not found', {
        cause: new Error(),
        description: `Transaction with id ${uid} not found`,
      });
    }

    const updatedTransaction = await this.findByUid(uid);
    return plainToInstance(TransactionResponseDto, updatedTransaction, {
      excludeExtraneousValues: true,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
