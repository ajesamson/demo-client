import { PartialType } from '@nestjs/swagger';
import { WalletResponseDto } from './wallet-response.dto';
import { Expose, Type } from 'class-transformer';
import { TransactionSummaryResponseDto } from 'src/transactions/dto/transaction-summary-response.dto';

export class WalletTransactionsResponseDto extends PartialType(
  WalletResponseDto,
) {
  @Expose()
  @Type(() => TransactionSummaryResponseDto)
  transactions: TransactionSummaryResponseDto[];

  static fromJoinRow(rows: any[]): WalletTransactionsResponseDto {
    const { uid, balance, currency } = rows[0];
    const transactions = rows.map(
      (row) =>
        ({
          id: row.transaction_id,
          type: row.type,
          amount: row.amount,
          description: row.description,
          created_at: row.created_at,
        }) as TransactionSummaryResponseDto,
    );

    return {
      id: uid,
      balance,
      currency,
      transactions,
    };
  }
}
