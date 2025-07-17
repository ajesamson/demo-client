import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexService } from 'src/knex/knex.service';
import { CreateTransferEntity } from '../entities/create-transfer.entity';
import { TransferEntity } from '../entities/transfer.entity';

@Injectable()
export class TransferRepository {
  private readonly table = 'transfers';

  constructor(private readonly knexService: KnexService) {}

  async create(trx: Knex, data: CreateTransferEntity): Promise<number> {
    const [transferId] = await trx<TransferEntity>(this.table).insert(data);
    return transferId;
  }
}
