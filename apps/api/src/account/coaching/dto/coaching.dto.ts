import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../admin/dto/admin.dto';
import {
  AnalyticsPeriod,
  CoachAffiliationType,
  CoachLeadStage,
  CoachServiceDeliveryMode,
  CoachServiceStatus,
  CoachStudentEngagementLevel,
  CoachStudentStatus,
  EntityStatus,
  HealthAssessmentStatus,
  Privacy,
  SessionPackageStatus,
} from '../../../common/enums';

const TIME_RE = /^\d{2}:\d{2}$/;

// ── Services ──────────────────────────────────────────────────────────────

export class CoachServiceTravelDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radiusKm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee!: number;
}

export class CoachServiceDeliveryDto {
  @IsEnum(CoachServiceDeliveryMode)
  mode!: CoachServiceDeliveryMode;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  onlineProvider?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachServiceTravelDto)
  travel?: CoachServiceTravelDto;
}

export class CoachServicePricingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  durationMin!: number;
}

export class CreateCoachServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @ValidateNested()
  @Type(() => CoachServiceDeliveryDto)
  delivery!: CoachServiceDeliveryDto;

  @ValidateNested()
  @Type(() => CoachServicePricingDto)
  pricing!: CoachServicePricingDto;

  @IsOptional()
  @IsEnum(CoachServiceStatus)
  status?: CoachServiceStatus;
}

export class UpdateCoachServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachServiceDeliveryDto)
  delivery?: CoachServiceDeliveryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachServicePricingDto)
  pricing?: CoachServicePricingDto;

  @IsOptional()
  @IsEnum(CoachServiceStatus)
  status?: CoachServiceStatus;
}

export class ListCoachServicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CoachServiceStatus)
  status?: CoachServiceStatus;
}

// ── Availability ──────────────────────────────────────────────────────────

export class AvailabilityBuffersDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  beforeMin!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  afterMin!: number;
}

export class AvailabilityLocationDto {
  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

export class AvailabilityTimeOffDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AvailabilityWeeklyHourDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsString()
  @Matches(TIME_RE)
  startTime!: string;

  @IsString()
  @Matches(TIME_RE)
  endTime!: string;
}

export class UpsertCoachAvailabilityDto {
  @ValidateNested()
  @Type(() => AvailabilityBuffersDto)
  buffers!: AvailabilityBuffersDto;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityLocationDto)
  locations!: AvailabilityLocationDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityTimeOffDto)
  timeOff!: AvailabilityTimeOffDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWeeklyHourDto)
  weeklyHours?: AvailabilityWeeklyHourDto[];
}

// ── Affiliations ──────────────────────────────────────────────────────────

export class AffiliationContractDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}

export class CreateAffiliationDto {
  @IsMongoId()
  clubId!: string;

  @IsEnum(CoachAffiliationType)
  type!: CoachAffiliationType;

  @ValidateNested()
  @Type(() => AffiliationContractDto)
  contract!: AffiliationContractDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdateAffiliationDto {
  @IsOptional()
  @IsEnum(CoachAffiliationType)
  type?: CoachAffiliationType;

  @IsOptional()
  @ValidateNested()
  @Type(() => AffiliationContractDto)
  contract?: AffiliationContractDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

// ── Packages ──────────────────────────────────────────────────────────────

export class PackageSessionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  total!: number;
}

export class PackageValidityDto {
  @IsDateString()
  expiresAt!: string;
}

export class PackagePricingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateSessionPackageDto {
  @IsMongoId()
  athleteUserId!: string;

  @IsOptional()
  @IsMongoId()
  serviceId?: string;

  @ValidateNested()
  @Type(() => PackageSessionsDto)
  sessions!: PackageSessionsDto;

  @ValidateNested()
  @Type(() => PackageValidityDto)
  validity!: PackageValidityDto;

  @ValidateNested()
  @Type(() => PackagePricingDto)
  pricing!: PackagePricingDto;

  @IsOptional()
  @IsMongoId()
  paymentId?: string;
}

export class FreezePackageDto {
  @IsOptional()
  @IsDateString()
  unfreezeAt?: string;
}

export class ListPackagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SessionPackageStatus)
  status?: SessionPackageStatus;

  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;

  @IsOptional()
  @IsMongoId()
  coachUserId?: string;
}

// ── Students ──────────────────────────────────────────────────────────────

export class CoachStudentCoachingDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  goalKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  levelKey?: string;
}

export class CoachStudentEngagementDto {
  @IsOptional()
  @IsEnum(CoachStudentEngagementLevel)
  level?: CoachStudentEngagementLevel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsDateString()
  lastSessionAt?: string;
}

export class LinkStudentDto {
  @IsMongoId()
  athleteUserId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsEnum(CoachStudentStatus)
  status?: CoachStudentStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachStudentCoachingDto)
  coaching?: CoachStudentCoachingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachStudentEngagementDto)
  engagement?: CoachStudentEngagementDto;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsEnum(CoachStudentStatus)
  status?: CoachStudentStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachStudentCoachingDto)
  coaching?: CoachStudentCoachingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoachStudentEngagementDto)
  engagement?: CoachStudentEngagementDto;
}

export class ListStudentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CoachStudentStatus)
  status?: CoachStudentStatus;

  @IsOptional()
  @IsEnum(CoachStudentEngagementLevel)
  engagementLevel?: CoachStudentEngagementLevel;
}

export class CoachingAnalyticsQueryDto {
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}

// ── Leads ─────────────────────────────────────────────────────────────────

export class LeadContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}

export class CreateLeadDto {
  @ValidateNested()
  @Type(() => LeadContactDto)
  contact!: LeadContactDto;

  @IsOptional()
  @IsEnum(CoachLeadStage)
  stage?: CoachLeadStage;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}

export class UpdateLeadDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LeadContactDto)
  contact?: LeadContactDto;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}

export class UpdateLeadStageDto {
  @IsEnum(CoachLeadStage)
  stage!: CoachLeadStage;

  /** When converting, optionally create/link a CoachStudent. */
  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

export class ListLeadsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CoachLeadStage)
  stage?: CoachLeadStage;
}

// ── Health assessment ─────────────────────────────────────────────────────

export class HealthParqDto {
  @IsOptional()
  @IsBoolean()
  heartCondition?: boolean;

  @IsOptional()
  @IsBoolean()
  chestPainActivity?: boolean;

  @IsOptional()
  @IsBoolean()
  chestPainRest?: boolean;

  @IsOptional()
  @IsBoolean()
  dizziness?: boolean;

  @IsOptional()
  @IsBoolean()
  boneJointProblem?: boolean;

  @IsOptional()
  @IsBoolean()
  bloodPressureMeds?: boolean;

  @IsOptional()
  @IsBoolean()
  otherReason?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  otherReasonDetail?: string;
}

export class HealthAnswersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HealthParqDto)
  parq?: HealthParqDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  medications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  injuries?: string[];

  @IsOptional()
  @IsDateString()
  consentAt?: string;
}

export class UpsertHealthAssessmentDto {
  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @ValidateNested()
  @Type(() => HealthAnswersDto)
  answers?: HealthAnswersDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  limitations?: string[];

  @IsOptional()
  @IsEnum(HealthAssessmentStatus)
  status?: HealthAssessmentStatus;
}

export class ReviewHealthAssessmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class AdminListCoachingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  coachUserId?: string;

  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

// ── Direct messaging (N4) ─────────────────────────────────────────────────

export class ListCoachThreadsQueryDto extends PaginationQueryDto {}

export class ListCoachMessagesQueryDto extends PaginationQueryDto {}

export class SendCoachMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;
}

export class OpenCoachThreadDto {
  @IsMongoId()
  athleteUserId!: string;
}

export class OpenAthleteThreadDto {
  @IsMongoId()
  coachUserId!: string;
}
