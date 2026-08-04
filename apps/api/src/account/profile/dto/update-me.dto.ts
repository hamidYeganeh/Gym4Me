import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Privacy } from '../../../common/enums';

export class UpdateNameDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  first?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  last?: string;
}

export class UpdateAvatarDto {
  @IsOptional()
  @IsMongoId()
  mediaId?: string | null;
}

export class UpdateDemographicsDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

export class UpdateMeDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNameDto)
  name?: UpdateNameDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAvatarDto)
  avatar?: UpdateAvatarDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDemographicsDto)
  demographics?: UpdateDemographicsDto;

  /** Custom public handle, e.g. "mahdi-fit" */
  @IsOptional()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/, {
    message: 'code must be 3-40 chars: lowercase letters, digits, dashes',
  })
  code?: string;
}

export class AthleteBodyDto {
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg?: number;
}

export class AthletePrivacyDto {
  @IsOptional()
  @IsEnum(Privacy)
  metrics?: Privacy;

  @IsOptional()
  @IsEnum(Privacy)
  photos?: Privacy;
}

export class UpdateAthleteProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  levelKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AthleteBodyDto)
  body?: AthleteBodyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AthletePrivacyDto)
  privacy?: AthletePrivacyDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalKeys?: string[];
}

export class CoachExperienceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  years?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string;
}

export class CoachServiceAreaDto {
  @IsOptional()
  @IsMongoId()
  cityId?: string | null;
}

export class UpdateCoachProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachExperienceDto)
  experience?: CoachExperienceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachServiceAreaDto)
  serviceArea?: CoachServiceAreaDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtyKeys?: string[];
}

export class SubmitCoachVerificationDto {
  @IsArray()
  @IsMongoId({ each: true })
  documentMediaIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
