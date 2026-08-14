import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto as CommonPaginationQueryDto } from '../../basics/dto/common.dto';
import {
  AthleteDataGrantScope,
  AthleteDataGrantStatus,
  ExerciseStatus,
  HealthSyncProvider,
  HealthSyncStatus,
  MetricAggregation,
  MetricGoalOperator,
  MetricGoalPeriod,
  MetricGoalStatus,
  MetricPeriodKind,
  MetricPrivacyClass,
  MetricReminderChannel,
  MetricReminderStatus,
  MetricSource,
  MetricTypeStatus,
  MetricValueKind,
  Privacy,
  VerificationStatus,
  WorkoutLogStatus,
  WorkoutPlanStatus,
  WorkoutProgramStatus,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class PaginationQueryDto extends CommonPaginationQueryDto {}

// ── Exercises ─────────────────────────────────────────────────────────────

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  muscleKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentKeys?: string[];

  @IsOptional()
  @IsMongoId()
  mediaId?: string;

  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  muscleKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentKeys?: string[];

  @IsOptional()
  @IsMongoId()
  mediaId?: string | null;

  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus;
}

export class ListExercisesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ExerciseStatus)
  status?: ExerciseStatus;
}

export class AdminListExercisesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(ExerciseStatus, { each: true })
  status?: ExerciseStatus[];
}

// ── Workout plans ─────────────────────────────────────────────────────────

export class WorkoutPlanExerciseItemDto {
  @IsMongoId()
  exerciseId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sets!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class WorkoutPlanDayDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dayIndex!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanExerciseItemDto)
  exercises!: WorkoutPlanExerciseItemDto[];
}

export class WorkoutPlanWeekDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weekIndex!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanDayDto)
  days!: WorkoutPlanDayDto[];
}

export class WorkoutPlanPeriodDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}

export class CreateWorkoutPlanDto {
  /** Required when coach creates a plan for an athlete. */
  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(WorkoutPlanStatus)
  status?: WorkoutPlanStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanWeekDto)
  weeks?: WorkoutPlanWeekDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPlanPeriodDto)
  period?: WorkoutPlanPeriodDto;
}

export class UpdateWorkoutPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(WorkoutPlanStatus)
  status?: WorkoutPlanStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanWeekDto)
  weeks?: WorkoutPlanWeekDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPlanPeriodDto)
  period?: WorkoutPlanPeriodDto | null;
}

export class ListWorkoutPlansQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(WorkoutPlanStatus)
  status?: WorkoutPlanStatus;

  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

// ── Metrics ───────────────────────────────────────────────────────────────

export class CreateProgressMetricDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metricKey!: string;

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsEnum(MetricSource)
  source?: MetricSource;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  sourceRecordId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientMutationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPlanPeriodDto)
  period?: WorkoutPlanPeriodDto;

  @IsOptional()
  @IsDateString()
  periodStartAt?: string;

  @IsOptional()
  @IsDateString()
  periodEndAt?: string;
}

export class UpdateProgressMetricDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metricKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;
}

export class ListProgressMetricsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  metricKey?: string;

  @IsOptional()
  @IsEnum(MetricSource)
  source?: MetricSource;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  /** Coach view: athlete whose metrics to read (requires active grant). */
  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

export class MetricsSummaryQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  metricKeys?: string[];

  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

export class SyncProgressMetricItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metricKey!: string;

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsDateString()
  recordedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsEnum(MetricSource)
  source!: MetricSource;

  @ValidateIf((o: SyncProgressMetricItemDto) => !o.clientMutationId)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  sourceRecordId?: string;

  @ValidateIf((o: SyncProgressMetricItemDto) => !o.sourceRecordId)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  clientMutationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPlanPeriodDto)
  period?: WorkoutPlanPeriodDto;

  @IsOptional()
  @IsDateString()
  periodStartAt?: string;

  @IsOptional()
  @IsDateString()
  periodEndAt?: string;
}

export class SyncProgressMetricsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(250)
  @ValidateNested({ each: true })
  @Type(() => SyncProgressMetricItemDto)
  entries!: SyncProgressMetricItemDto[];
}

// ── Photos ────────────────────────────────────────────────────────────────

export class CreateProgressPhotoDto {
  @IsMongoId()
  mediaId!: string;

  @IsDateString()
  capturedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;
}

export class UpdateProgressPhotoDto {
  @IsOptional()
  @IsMongoId()
  mediaId?: string;

  @IsOptional()
  @IsDateString()
  capturedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;
}

export class ListProgressPhotosQueryDto extends PaginationQueryDto {}

// ── Metric types (catalog) ────────────────────────────────────────────────

export class MetricTypeValidationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  step?: number;

  @IsOptional()
  @IsBoolean()
  integer?: boolean;
}

export class CreateMetricTypeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  key!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEnum(MetricValueKind)
  valueKind!: MetricValueKind;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  canonicalUnit?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetricTypeValidationDto)
  validation?: MetricTypeValidationDto;

  @IsOptional()
  @IsEnum(MetricAggregation)
  aggregation?: MetricAggregation;

  @IsOptional()
  @IsEnum(MetricPeriodKind)
  periodKind?: MetricPeriodKind;

  @IsOptional()
  @IsEnum(MetricPrivacyClass)
  privacyClass?: MetricPrivacyClass;

  @IsOptional()
  @IsObject()
  sourceMappings?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sportId?: string;

  @IsOptional()
  @IsEnum(MetricTypeStatus)
  status?: MetricTypeStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortHint?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  chartKind?: string;
}

export class UpdateMetricTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(MetricValueKind)
  valueKind?: MetricValueKind;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  canonicalUnit?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetricTypeValidationDto)
  validation?: MetricTypeValidationDto | null;

  @IsOptional()
  @IsEnum(MetricAggregation)
  aggregation?: MetricAggregation;

  @IsOptional()
  @IsEnum(MetricPeriodKind)
  periodKind?: MetricPeriodKind;

  @IsOptional()
  @IsEnum(MetricPrivacyClass)
  privacyClass?: MetricPrivacyClass;

  @IsOptional()
  @IsObject()
  sourceMappings?: Record<string, string> | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sportId?: string | null;

  @IsOptional()
  @IsEnum(MetricTypeStatus)
  status?: MetricTypeStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortHint?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  chartKind?: string | null;
}

export class ListMetricTypesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MetricTypeStatus)
  status?: MetricTypeStatus;
}

export class AdminListMetricTypesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(MetricTypeStatus, { each: true })
  status?: MetricTypeStatus[];
}

// ── Workout programs (templates) ──────────────────────────────────────────

export class WorkoutProgramMetaDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  focusLabel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weekCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsPerWeek?: number;
}

export class CreateWorkoutProgramDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(WorkoutProgramStatus)
  status?: WorkoutProgramStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutProgramMetaDto)
  meta?: WorkoutProgramMetaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanWeekDto)
  weeks?: WorkoutPlanWeekDto[];
}

export class UpdateWorkoutProgramDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(WorkoutProgramStatus)
  status?: WorkoutProgramStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutProgramMetaDto)
  meta?: WorkoutProgramMetaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanWeekDto)
  weeks?: WorkoutPlanWeekDto[];
}

export class ListWorkoutProgramsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(WorkoutProgramStatus)
  status?: WorkoutProgramStatus;
}

export class AssignWorkoutProgramDto {
  @IsMongoId()
  athleteUserId!: string;

  @IsOptional()
  @IsEnum(WorkoutPlanStatus)
  status?: WorkoutPlanStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutPlanPeriodDto)
  period?: WorkoutPlanPeriodDto;
}

// ── Coach exercise submit / admin review ──────────────────────────────────

export class ReviewExerciseVerificationDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus.APPROVED | VerificationStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class ListPendingExercisesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  verification?: VerificationStatus;
}

// ── Workout logs ──────────────────────────────────────────────────────────

export class WorkoutLogTimingDto {
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSec?: number;
}

export class WorkoutLogPainDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  score?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bodyAreaKeys?: string[];
}

export class WorkoutLogSetDto {
  @IsMongoId()
  exerciseId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  reps!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;
}

export class CreateWorkoutLogDto {
  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsMongoId()
  planRevisionId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sessionIndex!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutLogSetDto)
  sets?: WorkoutLogSetDto[];

  @IsOptional()
  @IsEnum(WorkoutLogStatus)
  status?: WorkoutLogStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutLogTimingDto)
  timing?: WorkoutLogTimingDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutLogPainDto)
  pain?: WorkoutLogPainDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientMutationId?: string;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}

export class UpdateWorkoutLogDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutLogSetDto)
  sets?: WorkoutLogSetDto[];

  @IsOptional()
  @IsEnum(WorkoutLogStatus)
  status?: WorkoutLogStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutLogTimingDto)
  timing?: WorkoutLogTimingDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkoutLogPainDto)
  pain?: WorkoutLogPainDto | null;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;
}

export class ListWorkoutLogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  planId?: string;

  @IsOptional()
  @IsMongoId()
  athleteId?: string;

  @IsOptional()
  @IsEnum(WorkoutLogStatus)
  status?: WorkoutLogStatus;
}

// ── Personal records ──────────────────────────────────────────────────────

export class CreatePersonalRecordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metricTypeKey!: string;

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsOptional()
  @IsDateString()
  achievedAt?: string;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListPersonalRecordsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  athleteId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  metricTypeKey?: string;
}

// ── Goals ─────────────────────────────────────────────────────────────────

export class MetricGoalTargetDto {
  @IsEnum(MetricGoalOperator)
  operator!: MetricGoalOperator;

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  unit?: string;
}

export class MetricGoalEffectiveDto {
  @IsDateString()
  start!: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}

export class CreateMetricGoalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  metricKey!: string;

  @ValidateNested()
  @Type(() => MetricGoalTargetDto)
  target!: MetricGoalTargetDto;

  @IsEnum(MetricGoalPeriod)
  period!: MetricGoalPeriod;

  @ValidateNested()
  @Type(() => MetricGoalEffectiveDto)
  effective!: MetricGoalEffectiveDto;

  @IsOptional()
  @IsEnum(MetricGoalStatus)
  status?: MetricGoalStatus;
}

export class UpdateMetricGoalDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricGoalTargetDto)
  target?: MetricGoalTargetDto;

  @IsOptional()
  @IsEnum(MetricGoalPeriod)
  period?: MetricGoalPeriod;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetricGoalEffectiveDto)
  effective?: MetricGoalEffectiveDto;

  @IsOptional()
  @IsEnum(MetricGoalStatus)
  status?: MetricGoalStatus;
}

export class ListMetricGoalsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  metricKey?: string;

  @IsOptional()
  @IsEnum(MetricGoalStatus)
  status?: MetricGoalStatus;
}

// ── Reminders ─────────────────────────────────────────────────────────────

export class MetricReminderScheduleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  timezone!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays?: number[];

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  localTime!: string;
}

export class MetricReminderQuietHoursDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  start?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  end?: string;
}

export class UpsertMetricReminderDto {
  @ValidateNested()
  @Type(() => MetricReminderScheduleDto)
  schedule!: MetricReminderScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetricReminderQuietHoursDto)
  quietHours?: MetricReminderQuietHoursDto | null;

  @IsOptional()
  @IsEnum(MetricReminderChannel)
  channel?: MetricReminderChannel;

  /** Defaults to paused (opt-in). Pass active to enable. */
  @IsOptional()
  @IsEnum(MetricReminderStatus)
  status?: MetricReminderStatus;
}

export class ListMetricRemindersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MetricReminderStatus)
  status?: MetricReminderStatus;
}

// ── Data grants ───────────────────────────────────────────────────────────

export class CreateAthleteDataGrantDto {
  @IsMongoId()
  granteeUserId!: string;

  @IsMongoId()
  relationshipId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(AthleteDataGrantScope, { each: true })
  scopes!: AthleteDataGrantScope[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ListAthleteDataGrantsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AthleteDataGrantStatus)
  status?: AthleteDataGrantStatus;
}

// ── Health sync ───────────────────────────────────────────────────────────

export class UpsertHealthSyncStateDto {
  @IsEnum(HealthSyncStatus)
  status!: HealthSyncStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authorizedMetricKeys?: string[];

  @IsOptional()
  @IsObject()
  cursorByMetric?: Record<string, string>;

  @IsOptional()
  @IsDateString()
  lastSyncAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastErrorCode?: string | null;
}

export class ListHealthSyncStatesQueryDto {
  @IsOptional()
  @IsEnum(HealthSyncProvider)
  provider?: HealthSyncProvider;
}

// ── Data rights (export / delete / consent) ────────────────────────────────

export class DeleteProgressMetricsDto {
  /**
   * Must equal `DELETE_METRICS` to confirm irreversible bulk delete.
   * Prior health samples remain unless this endpoint is used.
   */
  @IsString()
  @Matches(/^DELETE_METRICS$/)
  confirmation!: 'DELETE_METRICS';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricKeys?: string[];
}
