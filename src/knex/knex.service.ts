import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Knex, knex } from 'knex';
import config from 'knexfile';

@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy {
  private knexInstance: Knex;

  onModuleInit() {
    this.knexInstance = knex(config);
  }

  async onModuleDestroy() {
    await this.knexInstance?.destroy();
  }

  get connection(): Knex {
    return this.knexInstance;
  }
}
