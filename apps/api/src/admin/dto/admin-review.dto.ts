import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ClubLifecycleStatus, VerificationStatus } from '../../common/enums';
import { Type } from 'class-transformer';

export class ReviewVerificationDto {
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}

export class ListCoachVerificationsQueryDto {
  @IsOptional()
  @IsIn([...Object.values(VerificationStatus), 'all'])
  status?: VerificationStatus | 'all';

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
}

export class ListClubReviewsQueryDto {
  @IsOptional()
  @IsIn([...Object.values(ClubLifecycleStatus), 'all'])
  status?: ClubLifecycleStatus | 'all';

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
}
