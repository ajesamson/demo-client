import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { KnexService } from '../knex/knex.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { plainToInstance } from 'class-transformer';
import { Knex } from 'knex';
import { WalletEntity } from './entities/wallet.entity';
import { TransactionTypesEnum } from '../common/enums/transaction-types.enum';
import { WalletUserEntity } from './entities/wallet-user.entity';
import { WalletUserResponseDto } from './dto/wallet-user-response.dto';
import { WalletTransactionsResponseDto } from './dto/wallet-transactions-response.dto';
import { WalletRepository } from './repositories/wallet.repository';

@Injectable()
export class WalletsService {
  private readonly dbTable = 'wallets';
  private readonly dbUserTable = 'users';
  private readonly dbTransactionsTable = 'transactions';

  constructor(
    private readonly knexService: KnexService,
    private readonly repo: WalletRepository,
  ) {}

  async create(user_id: number, trx?: Knex.Transaction): Promise<number> {
    const walletId = await this.repo.create(user_id, trx);
    if (!walletId) {
      throw new BadRequestException('User already has wallet', {
        cause: new Error(),
        description: `Duplicate wallet creation request`,
      });
    }

    return walletId;
  }

  async findByUserId(userId: number): Promise<WalletEntity | undefined> {
    return await this.repo.findByField({ user_id: userId });
  }

  async findUserWallet(userId: number): Promise<WalletResponseDto> {
    const wallet = await this.repo.findByField({ user_id: userId });
    if (wallet == undefined) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `User has no wallet`,
      });
    }

    return plainToInstance(WalletResponseDto, wallet, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: number): Promise<WalletEntity> {
    const wallet = await this.repo.findByField({ id });

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id not found`,
      });
    }

    return wallet;
  }

  async findByUid(uid: string): Promise<WalletEntity> {
    const wallet = await this.repo.findByField({ uid });

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id ${uid} not found`,
      });
    }

    return wallet;
  }

  async findByUidList(
    uidList: string[],
    trx: Knex,
  ): Promise<WalletUserEntity[]> {
    const wallets = await this.repo.findUserWalletsByUid(uidList, trx);

    if (wallets == undefined) {
      throw new NotFoundException('Wallets not found', {
        cause: new Error(),
        description: `One or more wallets could not found`,
      });
    }

    return wallets;
  }

  async findAll(): Promise<WalletResponseDto[]> {
    const wallets = await this.repo.findAll();
    return plainToInstance(WalletResponseDto, wallets, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string): Promise<WalletUserResponseDto> {
    const data = await this.repo.findOne(uid);

    const dataFromRow = WalletUserResponseDto.fromJoinRow(data);
    return plainToInstance(WalletUserResponseDto, dataFromRow, {
      excludeExtraneousValues: true,
    });
  }

  async findWalletTransactions(
    uid: string,
  ): Promise<WalletTransactionsResponseDto> {
    const data = await this.repo.findWalletTransactions(uid);

    const dataFromRow = WalletTransactionsResponseDto.fromJoinRow(data);
    return plainToInstance(WalletTransactionsResponseDto, dataFromRow, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    updateWalletDto: UpdateWalletDto,
    trx?: Knex.Transaction,
  ): Promise<WalletResponseDto> {
    const updatedWallet = await this.repo.update(uid, updateWalletDto, trx);
    if (!updatedWallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id ${uid} not found`,
      });
    }

    return plainToInstance(WalletResponseDto, updatedWallet, {
      excludeExtraneousValues: true,
    });
  }

  async updateBalance(
    trx: Knex,
    id: number,
    amount: string,
    type: TransactionTypesEnum,
  ) {
    return await this.repo.updateBalance(trx, id, amount, type);
  }
}
