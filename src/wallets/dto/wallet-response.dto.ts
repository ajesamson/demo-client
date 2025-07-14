import { Expose } from 'class-transformer';

export class WalletResponseDto {
  @Expose()
  uid: string;

  @Expose()
  balance: number;

  @Expose()
  currency: string;
}
