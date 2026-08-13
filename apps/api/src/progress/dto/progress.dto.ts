import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
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
  ExerciseStatus,
  MetricTypeStatus,
  MetricValueKind,
  Privacy,
  VerificationStatus,
  WorkoutLogStatus,
  WorkoutPlanStatus,
  WorkoutProgramStatus,
} from '../../common/enums';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  page_size?: number;
}

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
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
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;
}

export class CreateWorkoutLogDto {
  @IsMongoId()
  planId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sessionIndex!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutLogSetDto)
  sets!: WorkoutLogSetDto[];

  @IsEnum(WorkoutLogStatus)
  status!: WorkoutLogStatus;

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
