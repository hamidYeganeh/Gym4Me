import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  APP_PLATFORMS,
  FEATURE_FLAG_STATUSES,
  RELEASE_CHANNELS,
} from '../../schemas/feature-flag.schema';

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const FEATURE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

export class MobileBootstrapQueryDto {
  @IsIn(APP_PLATFORMS)
  platform!: 'ios' | 'android' | 'web';

  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  appVersion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  buildNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  installationId?: string;

  @IsOptional()
  @IsIn(RELEASE_CHANNELS)
  channel?: 'production' | 'beta' | 'development';
}

export class FeatureFlagRuleDto {
  @IsArray()
  @IsIn(APP_PLATFORMS, { each: true })
  platforms!: ('ios' | 'android' | 'web')[];

  @IsArray()
  @IsIn(RELEASE_CHANNELS, { each: true })
  channels!: ('production' | 'beta' | 'development')[];

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  minAppVersion?: string;

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  maxAppVersion?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage!: number;

  @IsString()
  @MaxLength(64)
  variant!: string;
}

export class UpsertFeatureFlagDto {
  @IsIn(FEATURE_FLAG_STATUSES)
  status!: 'draft' | 'active' | 'paused' | 'archived';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage!: number;

  @IsArray()
  @IsIn(APP_PLATFORMS, { each: true })
  platforms!: ('ios' | 'android' | 'web')[];

  @IsArray()
  @IsIn(RELEASE_CHANNELS, { each: true })
  channels!: ('production' | 'beta' | 'development')[];

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  minimumAppVersion?: string;

  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  maximumAppVersion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureFlagRuleDto)
  rules?: FeatureFlagRuleDto[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  defaultVariant?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class FeatureFlagKeyParamDto {
  @IsString()
  @Matches(FEATURE_KEY_PATTERN)
  @MaxLength(120)
  key!: string;
}

export class ReleaseNotesDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(120, { each: true })
  features!: string[];
}

export class UpsertReleasePolicyDto {
  @IsIn(APP_PLATFORMS)
  platform!: 'ios' | 'android' | 'web';

  @IsOptional()
  @IsIn(RELEASE_CHANNELS)
  channel?: 'production' | 'beta' | 'development';

  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  latestAppVersion!: string;

  @IsString()
  @Matches(VERSION_PATTERN)
  @MaxLength(40)
  minimumSupportedAppVersion!: string;

  @IsString()
  @Matches(/^\d+$/)
  @MaxLength(12)
  recommendedApiVersion!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  updateUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReleaseNotesDto)
  releaseNotes?: ReleaseNotesDto;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
