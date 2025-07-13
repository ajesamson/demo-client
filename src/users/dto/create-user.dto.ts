import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Validate,
} from 'class-validator';
import { Match } from 'src/validators/match.validator';

export class CreateUserDto {
  /**
   * @example user@mail.com */
  @MaxLength(45)
  @IsEmail()
  email: string;

  /** @example Password */
  @IsString()
  @IsNotEmpty()
  password: string;

  /** @example Password */
  @IsString()
  @Validate(Match, ['password'])
  confirm_password: string;

  /** @example 'John Doe' */
  @IsString()
  @MaxLength(45)
  @Transform(({ value }) => value?.trim())
  fullname: string;

  /** @example +2341234567890 */
  @IsString()
  @MaxLength(14)
  @Matches(/^\+234\d{10}$/, {
    message: 'Phone number must start with +234 and contain only 10 digit',
  })
  mobile: string;
}
