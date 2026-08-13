import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
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
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  ClubUserReviewStatus,
  GeoDirection,
  OperatingHourAudience,
  RulePolicy,
  WeekdayStatus,
} from '../../../common/enums';
import { GeoPointDto, PaginationQueryDto } from '../../../basics/dto/common.dto';
import { toStringArray } from '../../../common/utils/list-query.util';

export class ClubIdentityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;
}

export class ClubIdentityPatchDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;
}

export class ClubPhoneDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  number!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;
}

export class ClubContactDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubPhoneDto)
  phones?: ClubPhoneDto[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class ClubGalleryItemDto {
  @IsMongoId()
  mediaId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class CancellationRuleDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  hoursBeforeReservation!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  feePercent!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;
}

export class ClubCancellationDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationRuleDto)
  rules?: CancellationRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationRuleDto)
  peakRules?: CancellationRuleDto[];
}

export class ClubLocationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(400)
  address!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  point?: GeoPointDto;

  @IsOptional()
  @IsEnum(GeoDirection)
  direction?: GeoDirection;

  @IsOptional()
  @IsMongoId()
  locationId?: string;
}

export class OperatingHourDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsEnum(WeekdayStatus)
  status!: WeekdayStatus;

  @IsOptional()
  @IsEnum(OperatingHourAudience)
  audience?: OperatingHourAudience;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  open?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  close?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class ClubAudienceDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  genderPolicy?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  ageGroupKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  levelKeys?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  accessibility?: string;
}

export class ClubSocialDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  platform!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  url!: string;
}

export class ClubRuleDto {
  @IsEnum(RulePolicy)
  policy!: RulePolicy;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ClubFaqDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description!: string;
}

export class CreateClubDto {
  @ValidateNested()
  @Type(() => ClubIdentityDto)
  identity!: ClubIdentityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubContactDto)
  contact?: ClubContactDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubGalleryItemDto)
  gallery?: ClubGalleryItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubCancellationDto)
  cancellation?: ClubCancellationDto;

  /** Equipment ref ids → stored as [{ equipmentId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  equipmentIds?: string[];

  /** Amenity ref ids → stored as [{ amenityId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  amenityIds?: string[];

  /** Category ref ids → stored as [{ categoryId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  /** Sport ids → stored as [{ sportId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  sportIds?: string[];

  /** Class ids → stored as [{ classId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  classIds?: string[];

  /** Coach user ids → stored as [{ coachId }] */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  coachIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubLocationDto)
  location?: ClubLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubAudienceDto)
  audience?: ClubAudienceDto;

  @IsOptional()
  @IsMongoId()
  parentClubId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours?: OperatingHourDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubSocialDto)
  socials?: ClubSocialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubRuleDto)
  rules?: ClubRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubFaqDto)
  faq?: ClubFaqDto[];
}

export class UpdateClubDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ClubIdentityPatchDto)
  identity?: ClubIdentityPatchDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubContactDto)
  contact?: ClubContactDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubGalleryItemDto)
  gallery?: ClubGalleryItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubCancellationDto)
  cancellation?: ClubCancellationDto;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  equipmentIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  amenityIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  classIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  coachIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubLocationDto)
  location?: ClubLocationDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubAudienceDto)
  audience?: ClubAudienceDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourDto)
  operatingHours?: OperatingHourDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubSocialDto)
  socials?: ClubSocialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubRuleDto)
  rules?: ClubRuleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubFaqDto)
  faq?: ClubFaqDto[];
}

export class AdminCreateClubDto extends CreateClubDto {
  @IsMongoId()
  ownerId!: string;
}

export class SubmitClubReviewDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMaxSize(20)
  documentMediaIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListClubsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsMongoId()
  sportId?: string;

  @IsOptional()
  @IsMongoId()
  locationId?: string;

  @IsOptional()
  @IsEnum(GeoDirection)
  direction?: GeoDirection;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(ClubLifecycleStatus, { each: true })
  lifecycleStatus?: ClubLifecycleStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(ClubOperationalStatus, { each: true })
  operationalStatus?: ClubOperationalStatus[];
}

export class DiscoveryClubsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsMongoId()
  sportId?: string;

  @IsOptional()
  @IsMongoId()
  locationId?: string;

  @IsOptional()
  @IsEnum(GeoDirection)
  direction?: GeoDirection;

  /** ChoiceGroup `gender_policy`: mixed | male_only | female_only */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  genderPolicy?: string;

  /** Amenity slug, e.g. parking */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  amenitySlug?: string;

  /** ChoiceGroup `age_group` value */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  ageGroupKey?: string;

  /** ChoiceGroup `club_level` value */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  levelKey?: string;

  /** standard | accessible */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  accessibility?: string;

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
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100_000)
  radiusMeters?: number;
}

export class CreateBranchDto extends CreateClubDto {}

export class AssignCoachDto {
  @IsMongoId()
  coachId!: string;
}

export class AssignClassDto {
  @IsMongoId()
  classId!: string;
}

export class ReviewCriterionRatingDto {
  @IsMongoId()
  criterionId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}

export class CreateUserReviewDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewCriterionRatingDto)
  criteria?: ReviewCriterionRatingDto[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;

  @IsOptional()
  @IsMongoId()
  bookingId?: string;
}

export class ReplyUserReviewDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text!: string;
}

export class ModerateUserReviewDto {
  @IsEnum(ClubUserReviewStatus)
  status!: ClubUserReviewStatus;
}

export class GrantAchievementDto {
  @IsMongoId()
  achievementId!: string;
}

export class ListUserReviewsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(ClubUserReviewStatus, { each: true })
  status?: ClubUserReviewStatus[];
}
