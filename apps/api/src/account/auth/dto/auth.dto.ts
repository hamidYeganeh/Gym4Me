import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IR_PHONE, normalizeIranPhone } from '../../../common/utils/phone.util';

export class PhoneDto {
  @Transform(({ value }) => normalizeIranPhone(value))
  @Matches(IR_PHONE, { message: 'phone must be like +989383729627' })
  phone!: string;
}

export class RequestOtpDto extends PhoneDto {}

export class ConfirmOtpDto extends PhoneDto {
  @IsString()
  @Length(5, 5)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode?: string;
}

export class LoginDto extends PhoneDto {
  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;

  /** Revoke every session of the current user. */
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}

export class ForgotPasswordDto extends PhoneDto {}

export class ForgotPasswordConfirmDto extends PhoneDto {
  @IsString()
  @Length(5, 5)
  code!: string;
}

export class ResetPasswordDto {
  @IsString()
  resetToken!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;
}
