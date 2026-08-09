import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  AuditAction,
  KycRequestKind,
  KycRequestStatus,
  KycStatus,
  Role,
  UserStatus,
} from '../../common/enums';
import {
  PASSWORD_MESSAGE,
  PASSWORD_PATTERN,
} from '../../common/utils/password.util';
import { IR_PHONE, normalizeIranPhone } from '../../common/utils/phone.util';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** @deprecated Prefer `page_size`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number;
}

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  /** Matches phone, name, code, or referral code. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  search?: string;
}

export class AdminCreateUserDto {
  @Transform(({ value }) => normalizeIranPhone(value))
  @Matches(IR_PHONE, { message: 'phone must be like +989383729627' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password?: string;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @Matches(/^\d{10}$/)
  nationalId?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

/** Optional reason for activate / deactivate shortcuts. */
export class UserActivationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}

export class ListKycRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(KycRequestStatus)
  status?: KycRequestStatus;

  @IsOptional()
  @IsEnum(KycRequestKind)
  kind?: KycRequestKind;
}

export class ReviewKycDto {
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class ListAuditLogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsString()
  targetUserId?: string;
}
