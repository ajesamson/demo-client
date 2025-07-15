import { PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { WalletResponseDto } from './wallet-response.dto';

export class WalletUserResponseDto extends PartialType(WalletResponseDto) {
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  static fromJoinRow(row: any): WalletUserResponseDto {
    return {
      id: row.uid,
      balance: row.balance,
      currency: row.currency,
      user: {
        id: row.user_id,
        email: row.email,
        fullname: row.fullname,
        mobile: row.mobile,
      },
    };
  }
}
