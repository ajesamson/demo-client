import { Injectable } from '@nestjs/common';
import { KnexService } from 'src/knex/knex.service';
import { TransactionEntity } from '../entities/transaction.entity';
import { Knex } from 'knex';
import { TransactionTransferEntity } from '../entities/transaction-transfer.entity';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

@Injectable()
export class TransactionRepository {
  private readonly table = 'transactions';

  constructor(private readonly knexService: KnexService) {}

  async findByField(
    where: Partial<TransactionEntity>,
    trx?: Knex,
  ): Promise<TransactionEntity | undefined> {
    const query = (trx ?? this.knexService.connection)<TransactionEntity>(
      this.table,
    );
    return await query.where(where).first();
  }

  async create(
    data: TransactionEntity[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    const query = (trx ?? this.knexService.connection)<TransactionEntity>(
      this.table,
    );
    const [transactionId] = await query.insert(data);
    return transactionId;
  }

  async findAll(): Promise<TransactionEntity[]> {
    return await this.knexService
      .connection(this.table)
      .join('transfers', 'transfers.id', 'transactions.transfer_id')
      .select(
        'transactions.uid',
        'transactions.type',
        'transactions.amount',
        'transactions.description',
        'transactions.reference',
        'transfers.uid as transfer_id',
      );
  }

  async findOne(uid: string): Promise<TransactionTransferEntity> {
    return await this.knexService
      .connection(this.table)
      .where({ 'transactions.uid': uid })
      .leftJoin('transfers', 'transfers.id', 'transactions.transfer_id')
      .leftJoin(
        'wallets as senderWallet',
        'senderWallet.id',
        'transfers.sender_wallet_id',
      )
      .leftJoin(
        'wallets as receiverWallet',
        'receiverWallet.id',
        'transfers.receiver_wallet_id',
      )
      .first(
        'transactions.uid',
        'transactions.type',
        'transactions.amount',
        'transactions.description',
        'transactions.reference',
        'transfers.uid as transfer_id',
        'senderWallet.uid as sender_wallet_id',
        'receiverWallet.uid as receiver_wallet_id',
        'transfers.amount as transfer_amount',
        'transfers.description as transfer_description',
      );
  }

  async update(
    uid: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionEntity | undefined> {
    const affectedRow = await this.knexService
      .connection<TransactionEntity>(this.table)
      .where({ uid })
      .update(dto);

    if (!affectedRow) {
      return undefined;
    }

    return await this.findByField({ uid });
  }
}
