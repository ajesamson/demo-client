import { Expose } from 'class-transformer';

export class TransactionResponseDto {
  @Expose({ name: 'uid' })
  id: string;

  @Expose()
  type: string;

  @Expose()
  amount: string;

  @Expose()
  description: string;

  @Expose()
  reference: string;

  @Expose()
  transfer_id: string;
}
