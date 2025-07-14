import { Expose } from 'class-transformer';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';

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
}
