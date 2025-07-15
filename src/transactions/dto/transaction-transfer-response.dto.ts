import { PartialType } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';
import { TransferResponseDto } from 'src/transfers/dtos/transfer-response.dto';
import { Expose, Type } from 'class-transformer';

export class TransactionTransferResponseDto extends PartialType(
  TransactionResponseDto,
) {
  @Expose()
  @Type(() => TransferResponseDto)
  transfer?: TransferResponseDto;

  static fromJoinRow(row: any): TransactionTransferResponseDto {
    return {
      id: row.uid,
      type: row.email,
      amount: row.amount,
      description: row.description,
      reference: row.reference,
      transfer_id: row.transfer_id,
      transfer: row.transfer_id
        ? {
            id: row.transfer_id,
            sender_wallet_id: row.sender_wallet_id,
            receiver_wallet_id: row.receiver_wallet_id,
            amount: row.transfer_amount,
            description: row.transfer_description,
          }
        : undefined,
    };
  }
}
