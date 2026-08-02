import { Role } from '../../generated/prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

// Self-registration roles. CLUB_STAFF is created by a club owner, ADMIN via seed.
export const SELF_REGISTER_ROLES = [
  Role.ATHLETE,
  Role.COACH,
  Role.CLUB_OWNER,
] as const;

export class RegisterDto {
  @ValidateIf((o: RegisterDto) => !o.email)
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست' })
  phone?: string;

  @ValidateIf((o: RegisterDto) => !o.phone)
  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  email?: string;

  @IsString()
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  @MaxLength(72)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsEnum(Role)
  @IsIn(SELF_REGISTER_ROLES as unknown as Role[], {
    message: 'نقش انتخابی مجاز نیست',
  })
  role!: Role;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}
