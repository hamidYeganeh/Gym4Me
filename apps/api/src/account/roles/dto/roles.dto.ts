import { Type, Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Role, VerificationStatus } from '../../../common/enums';
import { toStringArray } from '../../../common/utils/list-query.util';

const SELF_ROLES = [Role.COACH, Role.CLUB_OWNER] as const;

function toQueueStatusArray(params: TransformFnParams): string[] | undefined {
  const values = toStringArray(params);
  return values?.includes('all') ? [] : values;
}

export class ApplyRoleDto {
  @IsIn(SELF_ROLES)
  role!: Role.COACH | Role.CLUB_OWNER;
}

export class SubmitRoleRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  documentMediaIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListRoleRequestsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

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

  @IsOptional()
  @Transform(toQueueStatusArray)
  @IsEnum(VerificationStatus, { each: true })
  status?: VerificationStatus[];

  @IsOptional()
  @IsIn(SELF_ROLES)
  role?: Role.COACH | Role.CLUB_OWNER;
}

export class ReviewRoleRequestDto {
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reviewNote?: string;
}
