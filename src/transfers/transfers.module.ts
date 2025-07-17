import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransferRepository } from './repositories/transfers.repository';

@Module({
  providers: [TransfersService, TransferRepository],
  exports: [TransfersService],
})
export class TransfersModule {}
