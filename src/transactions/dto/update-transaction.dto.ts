import { IsOptional, IsString } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  reference: string;
}
