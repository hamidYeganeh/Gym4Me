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
import { toStringArray } from '../../common/utils/list-query.util';
import { IR_PHONE, normalizeIranPhone } from '../../common/utils/phone.util';
import { AccountDeletionRequestStatus } from '../../schemas/account-deletion-request.schema';

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

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(Role, { each: true })
  role?: Role[];

  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(UserStatus, { each: true })
  status?: UserStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(KycStatus, { each: true })
  kycStatus?: KycStatus[];
}

export class ListAccountDeletionRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(AccountDeletionRequestStatus, { each: true })
  status?: AccountDeletionRequestStatus[];
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
  @Transform(toStringArray)
  @IsEnum(KycRequestStatus, { each: true })
  status?: KycRequestStatus[];

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

export class StartImpersonationDto {
  @IsString()
  @MinLength(1)
  targetUserId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}
