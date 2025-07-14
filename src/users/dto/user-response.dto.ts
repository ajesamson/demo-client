import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose({ name: 'uid' })
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullname: string;

  @Expose()
  mobile: string;
}
