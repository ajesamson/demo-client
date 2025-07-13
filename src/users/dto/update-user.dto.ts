import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  Validate,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Match } from 'src/validators/match.validator';

export class UpdateUserDto {
  /** @example Password */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password: string;

  /** @example Password */
  @IsOptional()
  @IsString()
  @Validate(Match, ['password'])
  confirm_password: string;

  /** @example John Doe */
  @IsOptional()
  @IsString()
  @MaxLength(45)
  @Transform(({ value }) => value?.trim())
  fullname: string;
}
