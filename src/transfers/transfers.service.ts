import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { CreateTransferEntity } from './entities/create-transfer.entity';
import { TransferRepository } from './repositories/transfers.repository';

@Injectable()
export class TransfersService {
  constructor(private readonly repo: TransferRepository) {}

  async create(trx: Knex, data: CreateTransferEntity): Promise<number> {
    return await this.repo.create(trx, data);
  }
}
