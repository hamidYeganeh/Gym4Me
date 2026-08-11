import { Type } from 'class-transformer';
import {
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
import { Privacy, SocialPostStatus } from '../../common/enums';

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
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsArray()
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
