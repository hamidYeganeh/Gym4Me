import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  AchievementGrantMode,
  AchievementMetric,
  EntityStatus,
  GamificationSubjectType,
  PointRuleEvent,
  PointRuleRepeat,
  PointTransactionReason,
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

// ── Achievements ──────────────────────────────────────────────────────────

export class AchievementGrantRuleDto {
  @IsEnum(AchievementMetric)
  metric!: AchievementMetric;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  threshold!: number;
}

export class AchievementGrantConfigDto {
  @IsEnum(AchievementGrantMode)
  mode!: AchievementGrantMode;

  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementGrantRuleDto)
  rule?: AchievementGrantRuleDto;
}

export class CreateAchievementDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string;

  @IsOptional()
  @IsMongoId()
  badgeMediaId?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(GamificationSubjectType, { each: true })
  audience!: GamificationSubjectType[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bonusPoints?: number;

  @ValidateNested()
  @Type(() => AchievementGrantConfigDto)
  grant!: AchievementGrantConfigDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string;

  @IsOptional()
  @IsMongoId()
  badgeMediaId?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(GamificationSubjectType, { each: true })
  audience?: GamificationSubjectType[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bonusPoints?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementGrantConfigDto)
  grant?: AchievementGrantConfigDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class ListAchievementsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsEnum(GamificationSubjectType)
  audience?: GamificationSubjectType;
}

// ── Point rules ───────────────────────────────────────────────────────────

export class PointRuleAwardDto {
  @IsEnum(GamificationSubjectType)
  subjectType!: GamificationSubjectType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  points!: number;
}

export class PointRuleLimitsDto {
  @IsOptional()
  @IsEnum(PointRuleRepeat)
  repeat?: PointRuleRepeat;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dailyCap?: number;
}

export class PointRuleEffectiveDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class CreatePointRuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(PointRuleEvent)
  event!: PointRuleEvent;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PointRuleAwardDto)
  awards!: PointRuleAwardDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PointRuleLimitsDto)
  limits?: PointRuleLimitsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointRuleEffectiveDto)
  effective?: PointRuleEffectiveDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdatePointRuleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(PointRuleEvent)
  event?: PointRuleEvent;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PointRuleAwardDto)
  awards?: PointRuleAwardDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PointRuleLimitsDto)
  limits?: PointRuleLimitsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointRuleEffectiveDto)
  effective?: PointRuleEffectiveDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListPointRulesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsEnum(PointRuleEvent)
  event?: PointRuleEvent;
}

// ── Grants & adjustments ──────────────────────────────────────────────────

export class SubjectRefDto {
  @IsEnum(GamificationSubjectType)
  subjectType!: GamificationSubjectType;

  /** userId for athlete/coach, clubId for club. */
  @IsMongoId()
  subjectId!: string;
}

export class GrantAchievementSubjectDto extends SubjectRefDto {}

export class AdjustPointsDto extends SubjectRefDto {
  /** Positive credits, negative debits. */
  @Type(() => Number)
  @IsInt()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note!: string;
}

export class ListTransactionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GamificationSubjectType)
  subjectType?: GamificationSubjectType;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsEnum(PointTransactionReason)
  reason?: PointTransactionReason;

  @IsOptional()
  @IsMongoId()
  ruleId?: string;
}

export class ListGrantsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(GamificationSubjectType)
  subjectType?: GamificationSubjectType;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  achievementId?: string;
}
