import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  uid: string;

  @Expose()
  email: string;

  @Expose()
  fullname: string;

  @Expose()
  mobile: string;
}
