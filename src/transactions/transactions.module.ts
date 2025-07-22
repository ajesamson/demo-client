import { Logger, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { UsersModule } from 'src/users/users.module';
import { TransactionRepository } from './repositories/transaction.repository';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionRepository, Logger],
  imports: [WalletsModule, TransfersModule, UsersModule],
  exports: [TransactionsService],
})
export class TransactionsModule {}
