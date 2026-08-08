import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LocationKind } from '../../../common/enums';
import { GeoPointDto } from '../../dto/common.dto';

export class CreateLocationDto {
  @IsEnum(LocationKind)
  kind!: LocationKind;

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

  /** Inline SVG for country flags. */
  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  flagSvg?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  center?: GeoPointDto;

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
}

export class UpdateLocationDto {
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
  icon?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  flagSvg?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  center?: GeoPointDto | null;

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
}
