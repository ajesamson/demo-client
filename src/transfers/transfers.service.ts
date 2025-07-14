import { Injectable } from '@nestjs/common';
import { KnexService } from 'src/knex/knex.service';
import { Knex } from 'knex';
import { Transfer } from './entities/transfer.entity.dto';

interface TransferData {
  sender_wallet_id: number;
  receiver_wallet_id: number;
  amount: string;
  currency: string;
  description: string;
}

@Injectable()
export class TransfersService {
  private readonly dbTable = 'transfers';

  constructor(private readonly knexService: KnexService) {}

  async create(trx: Knex, data: TransferData): Promise<number> {
    const [transferId] = await trx<Transfer>(this.dbTable).insert(data);
    return transferId;
  }
}
