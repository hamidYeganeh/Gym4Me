import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ClubLifecycleStatus, VerificationStatus } from '../../common/enums';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
import { toStringArray } from '../../common/utils/list-query.util';

function toQueueStatusArray(params: TransformFnParams): string[] | undefined {
  const values = toStringArray(params);
  return values?.includes('all') ? [] : values;
}

export class ReviewVerificationDto {
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

class ReviewQueueQueryDto {
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
}

export class ListCoachVerificationsQueryDto extends ReviewQueueQueryDto {
  @IsOptional()
  @Transform(toQueueStatusArray)
  @IsEnum(VerificationStatus, { each: true })
  status?: VerificationStatus[];
}

export class ListClubReviewsQueryDto extends ReviewQueueQueryDto {
  @IsOptional()
  @Transform(toQueueStatusArray)
  @IsEnum(ClubLifecycleStatus, { each: true })
  status?: ClubLifecycleStatus[];
}
