import { IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class TransferResponseDto {
  @IsString()
  id: string;

  @IsInt()
  sender_wallet_id: number;

  @IsInt()
  receiver_wallet_id: number;

  @IsDecimal()
  amount: string;

  @IsOptional()
  @IsString()
  description: string;
}
