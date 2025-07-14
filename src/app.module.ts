import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnexModule } from './knex/knex.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [KnexModule, UsersModule, WalletsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
