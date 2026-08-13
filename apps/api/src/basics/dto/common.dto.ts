import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /** @deprecated Prefer `page_size`. Kept for backward-compatible clients. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
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

export class GeoPointDto {
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;
}

export class CreateNamedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  center?: GeoPointDto;
}

export class UpdateNamedDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  center?: GeoPointDto | null;
}
