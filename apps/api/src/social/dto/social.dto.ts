import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
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
import {
  Privacy,
  SocialFolloweeKind,
  SocialPostStatus,
  SocialReportStatus,
  SocialReportTargetKind,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  page_size?: number;
}

export class CreateSocialPostDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ArrayUnique()
  @IsMongoId({ each: true })
  mediaIds?: string[];

  @IsOptional()
  @IsEnum(SocialPostStatus)
  status?: SocialPostStatus;

  @IsOptional()
  @IsIn([Privacy.PUBLIC, Privacy.FOLLOWERS])
  visibility?: Privacy.PUBLIC | Privacy.FOLLOWERS;
}

export class UpdateSocialPostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ArrayUnique()
  @IsMongoId({ each: true })
  mediaIds?: string[];

  @IsOptional()
  @IsEnum(SocialPostStatus)
  status?: SocialPostStatus;

  @IsOptional()
  @IsIn([Privacy.PUBLIC, Privacy.FOLLOWERS])
  visibility?: Privacy.PUBLIC | Privacy.FOLLOWERS;
}

export class ListSocialPostsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  authorUserId?: string;
}

export class CreateSocialCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

export class ListSocialCommentsQueryDto extends PaginationQueryDto {}

export class FollowInputDto {
  @IsMongoId()
  followeeId!: string;

  @IsEnum(SocialFolloweeKind)
  followeeKind!: SocialFolloweeKind;
}

export class ListSocialFollowsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SocialFolloweeKind)
  followeeKind?: SocialFolloweeKind;
}

export class CreateSocialReportDto {
  @IsEnum(SocialReportTargetKind)
  targetKind!: SocialReportTargetKind;

  @IsMongoId()
  targetId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}

export class ListSocialReportsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(SocialReportStatus, { each: true })
  status?: SocialReportStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(SocialReportTargetKind, { each: true })
  targetKind?: SocialReportTargetKind[];

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

export class ResolveSocialReportDto {
  @IsEnum(SocialReportStatus)
  status!: SocialReportStatus.RESOLVED | SocialReportStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
