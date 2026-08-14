import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../admin/dto/admin.dto';
import {
  ArticleAudience,
  ArticleKind,
  PublishStatus,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class ArticleSeoDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class ArticleTaxonomyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  category!: string;

  @IsOptional()
  @IsEnum(ArticleKind)
  kind?: ArticleKind;

  @IsOptional()
  @IsEnum(ArticleAudience)
  audience?: ArticleAudience;
}

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500_000)
  body!: string;

  @ValidateNested()
  @Type(() => ArticleTaxonomyDto)
  taxonomy!: ArticleTaxonomyDto;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ArticleSeoDto)
  seo?: ArticleSeoDto;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500_000)
  body?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArticleTaxonomyDto)
  taxonomy?: ArticleTaxonomyDto;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ArticleSeoDto)
  seo?: ArticleSeoDto;
}

export class AdminListArticlesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PublishStatus, { each: true })
  publishStatus?: PublishStatus[];

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(ArticleKind, { each: true })
  kind?: ArticleKind[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(ArticleAudience, { each: true })
  audience?: ArticleAudience[];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;
}
