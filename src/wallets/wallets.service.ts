import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { KnexService } from 'src/knex/knex.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { plainToInstance } from 'class-transformer';
import { Knex } from 'knex';
import { Wallet } from './entities/wallet.entity';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';
import { WalletUser } from './entities/wallet-user.entity';

@Injectable()
export class WalletsService {
  private readonly dbTable = 'wallets';

  constructor(private readonly knexService: KnexService) {}

  async create(user_id: number, trx?: Knex.Transaction): Promise<number> {
    const query = (trx ?? this.knexService.connection)(this.dbTable);
    const hasWallet = await this.findByUserId(user_id);
    if (hasWallet != undefined) {
      throw new BadRequestException('User already has wallet', {
        cause: new Error(),
        description: `Duplicate wallet creation request`,
      });
    }
    const [id] = await query.insert({ user_id: user_id });

    return id;
  }

  async findUserWallet(userId: number): Promise<WalletResponseDto> {
    const wallet = await this.findByUserId(userId);
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

  async findByUserId(user_id: number): Promise<Wallet | undefined> {
    return await this.knexService
      .connection<Wallet>(this.dbTable)
      .where({ user_id })
      .first();
  }

  async findById(id: number): Promise<Wallet> {
    const wallet = await this.knexService
      .connection<Wallet>(this.dbTable)
      .where({ id })
      .first();

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id not found`,
      });
    }

    return wallet;
  }

  async findByUid(uid: string): Promise<Wallet> {
    const wallet = await this.knexService
      .connection<Wallet>(this.dbTable)
      .where({ uid })
      .first();

    if (!wallet) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id ${uid} not found`,
      });
    }

    return wallet;
  }

  async findByUidList(uidList: string[], trx: Knex): Promise<WalletUser[]> {
    const wallets: WalletUser[] = await trx<WalletUser>(this.dbTable)
      .whereIn('wallets.uid', uidList)
      .leftJoin('users', 'users.id', 'wallets.user_id')
      .select(
        'wallets.id as id',
        'wallets.uid as uid',
        'wallets.currency',
        'wallets.is_active as isWalletActive',
        'users.is_active as isUserActive',
        'users.is_onboarded as isUserOnboarded',
      );

    if (wallets.length != uidList.length) {
      throw new NotFoundException('Wallets not found', {
        cause: new Error(),
        description: `One or more wallets could not found`,
      });
    }

    return wallets;
  }

  async findAll(): Promise<WalletResponseDto[]> {
    const data = await this.knexService
      .connection<Wallet>(this.dbTable)
      .select();
    return plainToInstance(WalletResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(uid: string): Promise<WalletResponseDto> {
    const data = await this.findByUid(uid);
    return plainToInstance(WalletResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    uid: string,
    updateWalletDto: UpdateWalletDto,
    trx?: Knex.Transaction,
  ): Promise<WalletResponseDto> {
    const query = (trx ?? this.knexService.connection)(this.dbTable);
    const affectedRow = await query.where({ uid }).update(updateWalletDto);
    if (!affectedRow) {
      throw new NotFoundException('Wallet not found', {
        cause: new Error(),
        description: `Wallet with id ${uid} not found`,
      });
    }
    const updatedWallet = this.findByUid(uid);

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
    if (type == TransactionTypesEnum.CREDIT) {
      return await trx<Wallet>(this.dbTable)
        .where({ id })
        .increment('balance', +amount);
    } else {
      return await trx<Wallet>(this.dbTable)
        .where({ id })
        .decrement('balance', +amount);
    }
  }
}
