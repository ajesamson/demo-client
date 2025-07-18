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
import { TransactionEntity } from './entities/transaction.entity';
import { plainToInstance } from 'class-transformer';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { WalletUserEntity } from 'src/wallets/entities/wallet-user.entity';
import { UsersService } from 'src/users/users.service';
import { TransactionTransferResponseDto } from './dto/transaction-transfer-response.dto';
import { TransactionRepository } from './repositories/transaction.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly knexService: KnexService,
    private readonly walletService: WalletsService,
    private readonly transfersService: TransfersService,
    private readonly usersService: UsersService,
    private readonly repo: TransactionRepository,
  ) {}

  async create(
    dto: CreateTransactionDto,
    uid: string,
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
          // verify authenticated user is valid
          const user = await this.usersService.findByUid(uid, trx);
          if (!user) {
            throw new BadRequestException();
          }

          // get sender wallet and receiver wallets
          const walletUidList = [dto.wallet_id];
          if (dto.receiver_wallet_id) {
            walletUidList.push(dto.receiver_wallet_id);
          }
          const [senderWallet, receiverWallet] = await this.retrieveWallets(
            trx,
            walletUidList,
          );
          this.confirmWalletStatus(
            senderWallet,
            receiverWallet,
            dto.amount,
            dto.type,
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
          const userId = user.id;
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

          return await this.repo.findByField({ id: transactionId });
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
    senderWallet: WalletUserEntity,
    receiverWallet: WalletUserEntity | undefined,
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
    senderWallet: WalletUserEntity,
    receiverWallet: WalletUserEntity | undefined,
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

    return await this.repo.create(newTransaction as TransactionEntity[]);
  }

  async initiateTransfer(
    trx: Knex,
    senderWallet: WalletUserEntity,
    receiverWallet: WalletUserEntity,
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
  ): Promise<[WalletUserEntity, WalletUserEntity | undefined]> {
    const wallets = await this.walletService.findByUidList(uidList, trx);
    const senderWallet =
      wallets[0].uid === uidList[0] ? wallets[0] : wallets[1];
    let receiverWallet;
    if (uidList.length == 2) {
      receiverWallet = wallets[0].uid === uidList[1] ? wallets[0] : wallets[1];
    }

    return [senderWallet, receiverWallet];
  }

  confirmWalletStatus(
    senderWallet: WalletUserEntity,
    receiverWallet: WalletUserEntity | undefined,
    amount: string,
    type: TransactionTypesEnum,
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
    if (+senderWallet.balance < +amount && type == TransactionTypesEnum.DEBIT) {
      throw new BadRequestException('Insufficient fund', {
        description: `Your Wallet balance of ${senderWallet.balance} is insufficient`,
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

  async findAll(): Promise<TransactionTransferResponseDto[]> {
    const data = await this.repo.findAll();

    return plainToInstance(TransactionTransferResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string): Promise<TransactionTransferResponseDto> {
    const data = await this.repo.findOne(uid);

    if (!data) {
      throw new NotFoundException('Transaction not found', {
        cause: new Error(),
        description: `Transaction with id ${uid} not found`,
      });
    }

    return TransactionTransferResponseDto.fromJoinRow(data);
  }

  async findById(id: number): Promise<TransactionEntity | undefined> {
    return await this.repo.findByField({ id });
  }

  async findByUid(uid: string): Promise<TransactionEntity | undefined> {
    return await this.repo.findByField({ uid });
  }

  async update(
    uid: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const updatedTransaction = await this.repo.update(uid, dto);

    if (!updatedTransaction) {
      throw new NotFoundException('Transaction not found', {
        cause: new Error(),
        description: `Transaction with id ${uid} not found`,
      });
    }

    return plainToInstance(TransactionResponseDto, updatedTransaction, {
      excludeExtraneousValues: true,
    });
  }
}
