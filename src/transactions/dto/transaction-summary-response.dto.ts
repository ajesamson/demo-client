import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionSummaryResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: 'credit' | 'debit';

  @Expose()
  amount: string;

  @Expose()
  description: string;

  @Expose()
  created_at: Date;
}
