import { Expose } from 'class-transformer';

export class WalletResponseDto {
  @Expose({ name: 'uid' })
  id: string;

  @Expose()
  balance: number;

  @Expose()
  currency: string;
}
