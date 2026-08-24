import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Role } from '../../common/enums';
import {
  DISCOVERY_MAX_ITEMS_PER_SECTION,
  DISCOVERY_MAX_PAGE_SIZE,
  DISCOVERY_MAX_SECTIONS,
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoveryInterestMatch,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from '../discovery.constants';

export class DiscoveryActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  link!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  variant?: string;
}

export class DiscoveryContentDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoveryActionDto)
  action?: DiscoveryActionDto;
}

export class DiscoverySourceDto {
  @IsEnum(DiscoverySourceStrategy)
  strategy!: DiscoverySourceStrategy;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sort?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(DISCOVERY_MAX_ITEMS_PER_SECTION)
  limit!: number;
}

export class DiscoveryBackgroundDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  pattern?: string;
}

export class DiscoveryPresentationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  component!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  layout!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  cardVariant?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  rows?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoveryBackgroundDto)
  background?: DiscoveryBackgroundDto;
}

export class DiscoveryTargetingDto {
  @IsOptional()
  @IsEnum(DiscoveryAuthenticationTarget)
  authentication?: DiscoveryAuthenticationTarget;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  activeRoles?: Role[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  goalKeys?: string[];

  @IsOptional()
  @IsEnum(DiscoveryInterestMatch)
  match?: DiscoveryInterestMatch;
}

export class DiscoveryFallbackDto {
  @IsEnum(DiscoverySourceStrategy)
  strategy!: DiscoverySourceStrategy;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sort?: string;
}

export class DiscoverySectionDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,79}$/)
  id!: string;

  @IsEnum(DiscoverySectionKind)
  kind!: DiscoverySectionKind;

  @ValidateNested()
  @Type(() => DiscoveryContentDto)
  content!: DiscoveryContentDto;

  @ValidateNested()
  @Type(() => DiscoverySourceDto)
  source!: DiscoverySourceDto;

  @ValidateNested()
  @Type(() => DiscoveryPresentationDto)
  presentation!: DiscoveryPresentationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoveryTargetingDto)
  targeting?: DiscoveryTargetingDto;

  @IsOptional()
  @IsEnum(DiscoveryEmptyBehavior)
  emptyBehavior?: DiscoveryEmptyBehavior;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoveryFallbackDto)
  fallback?: DiscoveryFallbackDto;
}

export class UpdateDiscoveryDraftDto {
  @IsArray()
  @ArrayMaxSize(DISCOVERY_MAX_SECTIONS)
  @ValidateNested({ each: true })
  @Type(() => DiscoverySectionDto)
  sections!: DiscoverySectionDto[];
}

export class DiscoveryFeedQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,79}$/)
  page_key?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(DISCOVERY_MAX_PAGE_SIZE)
  page_size?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  feed_token?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsMongoId()
  locationId?: string;
}

export class DiscoveryPreviewContextDto {
  @IsOptional()
  @IsBoolean()
  authenticated?: boolean;

  @IsOptional()
  @IsEnum(Role)
  activeRole?: Role;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalKeys?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  levelKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsMongoId()
  locationId?: string;
}

export class PreviewDiscoveryDraftDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoveryPreviewContextDto)
  context?: DiscoveryPreviewContextDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(DISCOVERY_MAX_PAGE_SIZE)
  page_size?: number;
}

export class RollbackDiscoveryPageDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  revision!: number;
}
