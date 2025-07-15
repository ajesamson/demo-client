import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [WalletsModule, TransfersModule, UsersModule],
  exports: [TransactionsService],
})
export class TransactionsModule {}
