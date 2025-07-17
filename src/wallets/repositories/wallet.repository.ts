import { Injectable } from '@nestjs/common';
import { KnexService } from 'src/knex/knex.service';
import { Knex } from 'knex';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletUserEntity } from '../entities/wallet-user.entity';
import { WalletTransactionsEntity } from '../entities/wallet-transactions.entity';
import { UpdateWalletDto } from '../dto/update-wallet.dto';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';

@Injectable()
export class WalletRepository {
  private readonly table = 'wallets';
  private readonly userTable = 'users';
  private readonly transactionsTable = 'transactions';

  constructor(private readonly knexService: KnexService) {}

  async findAll(): Promise<WalletEntity[]> {
    return await this.knexService.connection<WalletEntity>(this.table).select();
  }

  async findByField(
    where: Partial<WalletEntity>,
    trx?: Knex,
  ): Promise<WalletEntity | undefined> {
    const query = (trx ?? this.knexService.connection)<WalletEntity>(
      this.table,
    );
    return await query.where(where).first();
  }

  async findUserWalletsByUid(
    uidList: string[],
    trx: Knex,
  ): Promise<WalletUserEntity[] | undefined> {
    const wallets: WalletUserEntity[] = await trx<WalletUserEntity>(this.table)
      .whereIn('wallets.uid', uidList)
      .leftJoin('users', 'users.id', 'wallets.user_id')
      .select(
        'wallets.id as id',
        'wallets.uid as uid',
        'wallets.currency',
        'wallets.balance',
        'wallets.is_active as isWalletActive',
        'users.is_active as isUserActive',
        'users.is_onboarded as isUserOnboarded',
      );

    if (wallets.length != uidList.length) {
      return undefined;
    }

    return wallets;
  }

  async findOne(uid: string): Promise<WalletUserEntity> {
    return await this.knexService
      .connection(this.table)
      .where({ 'wallets.uid': uid })
      .join(this.userTable, `${this.userTable}.id`, `${this.table}.user_id`)
      .first(
        `${this.table}.uid`,
        `${this.table}.balance`,
        `${this.table}.currency`,
        `${this.userTable}.uid as user_id`,
        `${this.userTable}.email`,
        `${this.userTable}.fullname`,
        `${this.userTable}.mobile`,
      );
  }

  async findWalletTransactions(
    uid: string,
  ): Promise<WalletTransactionsEntity[]> {
    return await this.knexService
      .connection(this.table)
      .where('wallets.uid', uid)
      .leftJoin(
        this.transactionsTable,
        `${this.transactionsTable}.wallet_id`,
        `${this.table}.id`,
      )
      .select(
        `${this.table}.uid`,
        `${this.table}.balance`,
        `${this.table}.currency`,
        `${this.transactionsTable}.uid as transaction_id`,
        `${this.transactionsTable}.type`,
        `${this.transactionsTable}.amount`,
        `${this.transactionsTable}.description`,
        `${this.transactionsTable}.created_at`,
      )
      .orderBy(`${this.transactionsTable}.created_at`, 'desc');
  }

  async create(userId: number, trx?: Knex): Promise<number | undefined> {
    const query = (trx ?? this.knexService.connection)(this.table);
    const hasWallet = await this.findByField({ user_id: userId }, trx);
    if (hasWallet != undefined) {
      return undefined;
    }
    const [id] = await query.insert({ user_id: userId });

    return id;
  }

  async update(
    uid: string,
    updateWalletDto: UpdateWalletDto,
    trx?: Knex,
  ): Promise<WalletEntity | undefined> {
    const query = (trx ?? this.knexService.connection)(this.table);
    const affectedRow = await query.where({ uid }).update(updateWalletDto);
    if (!affectedRow) {
      return undefined;
    }
    return await this.findByField({ uid });
  }

  async updateBalance(
    trx: Knex,
    id: number,
    amount: string,
    type: TransactionTypesEnum,
  ) {
    if (type == TransactionTypesEnum.CREDIT) {
      return await trx<WalletEntity>(this.table)
        .where({ id })
        .increment('balance', +amount);
    } else {
      return await trx<WalletEntity>(this.table)
        .where({ id })
        .decrement('balance', +amount);
    }
  }
}
