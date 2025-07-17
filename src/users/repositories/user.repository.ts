import { Injectable } from '@nestjs/common';
import { KnexService } from 'src/knex/knex.service';
import { UserEntity } from '../entities/user.entity';
import { Knex } from 'knex';

@Injectable()
export class UserRepository {
  private readonly table = 'users';

  constructor(private readonly knexService: KnexService) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.knexService.connection<UserEntity>(this.table).select();
  }

  async findByField(
    where: Partial<UserEntity>,
    trx?: Knex,
  ): Promise<UserEntity | undefined> {
    const query = (trx ?? this.knexService.connection)<UserEntity>(this.table);
    return await query.where(where).first();
  }

  async update(uid: string, data: UserEntity): Promise<UserEntity | undefined> {
    const affectedRow = await this.knexService
      .connection<UserEntity>(this.table)
      .where({
        uid,
      })
      .update(data);
    if (!affectedRow) {
      return undefined;
    }

    return await this.findByField({ uid });
  }

  async create(data: UserEntity, trx: Knex): Promise<number | undefined> {
    const user = await this.findByField({ email: data.email }, trx);
    if (user) {
      return undefined;
    }
    const [id] = await trx<UserEntity>(this.table).insert(data);
    return id;
  }
}
