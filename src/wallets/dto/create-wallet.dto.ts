import { IsString, IsUUID } from 'class-validator';

export class CreateWalletDto {
  /**@example f0e56007-6036-11f0-8b66-8a69e5abb4d4 */
  @IsString()
  @IsUUID()
  user_id: string;
}
