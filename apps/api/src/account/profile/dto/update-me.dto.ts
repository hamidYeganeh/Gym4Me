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
import {
  AthleteBodyType,
  AthleteExperience,
  AthleteMood,
  BloodGroup,
  Privacy,
  RhFactor,
} from '../../../common/enums';

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

export class UpdateAddressGeoDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsMongoId()
  provinceId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  apartment?: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'postalCode must be 10 digits' })
  postalCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressGeoDto)
  point?: UpdateAddressGeoDto | null;
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

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;

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

export class AthleteMetricsPrefsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredKeys?: string[];
}

export class AthleteLifestyleDto {
  @IsOptional()
  @IsEnum(AthleteBodyType)
  bodyType?: AthleteBodyType;

  @IsOptional()
  @IsEnum(AthleteExperience)
  experience?: AthleteExperience;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  sleepLevel?: number;

  @IsOptional()
  @IsEnum(AthleteMood)
  mood?: AthleteMood;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  diet?: string;

  /** null clears the value (user doesn't know their intake). */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20000)
  dailyCalories?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activityKeys?: string[];
}

export class AthleteBloodTypeDto {
  @IsEnum(BloodGroup)
  group!: BloodGroup;

  @IsEnum(RhFactor)
  rh!: RhFactor;
}

export class AthleteHealthDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AthleteBloodTypeDto)
  bloodType?: AthleteBloodTypeDto | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  conditions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  medications?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
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
  @ValidateNested()
  @Type(() => AthleteMetricsPrefsDto)
  metrics?: AthleteMetricsPrefsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goalKeys?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AthleteLifestyleDto)
  lifestyle?: AthleteLifestyleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AthleteHealthDto)
  health?: AthleteHealthDto;
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

export class CoachConsultationPricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  inPerson?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remote?: number | null;
}

export class CoachPricingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CoachConsultationPricingDto)
  consultation?: CoachConsultationPricingDto;
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
  @ValidateNested()
  @Type(() => CoachPricingDto)
  pricing?: CoachPricingDto;

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
