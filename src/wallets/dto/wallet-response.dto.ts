import { Expose } from 'class-transformer';

export class WalletResponseDto {
  @Expose({ name: 'uid' })
  id: string;

  @Expose()
  balance: string;

  @Expose()
  currency: string;
}
