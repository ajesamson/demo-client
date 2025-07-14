import { PartialType } from '@nestjs/swagger';
import { TransactionResponseDto } from './trasaction-response.dto';
import { TransferResponseDto } from 'src/transfers/dtos/transfer-response.dto';
import { Expose, Type } from 'class-transformer';

export class TransactionTransferResponseDto extends PartialType(
  TransactionResponseDto,
) {
  @Expose()
  @Type(() => TransferResponseDto)
  transfer?: TransferResponseDto;
}
