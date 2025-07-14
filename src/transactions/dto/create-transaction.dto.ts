import { Optional } from '@nestjs/common';
import {
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';

export class CreateTransactionDto {
  /**@example f0e56007-6036-11f0-8b66-8a69e5abb4d4 */
  @IsUUID()
  wallet_id: string;

  /** @example credit */
  @IsEnum(TransactionTypesEnum)
  type: TransactionTypesEnum;

  /** @example 200.00 */
  @IsDecimal()
  amount: string;

  /**@example f0e56007-6036-11f0-8b66-8a69e5abb4d4 */
  @IsOptional()
  @IsUUID()
  receiver_wallet_id?: string;

  /**@example 'Investing in stocks' */
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference: string;
}
