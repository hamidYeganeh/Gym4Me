import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { EventWriterService } from '../analytics/event-writer.service';
import { AuditService } from '../audit/audit.service';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import { OutboxService } from '../outbox/outbox.service';
import {
  AnalyticsEventName,
  AuditAction,
  AthleteDataGranteeType,
  AthleteDataGrantScope,
  AthleteDataGrantStatus,
  CoachStudentStatus,
  ExerciseOriginKind,
  ExerciseStatus,
  HealthSyncProvider,
  HealthSyncStatus,
  MetricAggregation,
  MetricGoalStatus,
  MetricPeriodKind,
  MetricPrivacyClass,
  MetricReminderChannel,
  MetricReminderStatus,
  MetricSource,
  MetricTypeStatus,
  MetricValueKind,
  NotificationTemplateKey,
  Privacy,
  Role,
  VerificationStatus,
  WorkoutLogStatus,
  WorkoutPlanStatus,
  WorkoutProgramOwnerType,
  WorkoutProgramStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import {
  AthleteDataGrant,
  AthleteDataGrantDocument,
} from '../schemas/athlete-data-grant.schema';
import {
  CoachStudent,
  CoachStudentDocument,
} from '../schemas/coach-student.schema';
import { Exercise, ExerciseDocument } from '../schemas/exercise.schema';
import {
  HealthSyncState,
  HealthSyncStateDocument,
} from '../schemas/health-sync-state.schema';
import { MetricGoal, MetricGoalDocument } from '../schemas/metric-goal.schema';
import {
  MetricReminder,
  MetricReminderDocument,
} from '../schemas/metric-reminder.schema';
import { MetricType, MetricTypeDocument } from '../schemas/metric-type.schema';
import {
  PersonalRecord,
  PersonalRecordDocument,
} from '../schemas/personal-record.schema';
import {
  ProgressMetric,
  ProgressMetricDocument,
} from '../schemas/progress-metric.schema';
import {
  ProgressPhoto,
  ProgressPhotoDocument,
} from '../schemas/progress-photo.schema';
import { WorkoutLog, WorkoutLogDocument } from '../schemas/workout-log.schema';
import {
  WorkoutPlan,
  WorkoutPlanDocument,
  WorkoutPlanRevision,
} from '../schemas/workout-plan.schema';
import {
  WorkoutProgram,
  WorkoutProgramDocument,
} from '../schemas/workout-program.schema';
import {
  AdminListExercisesQueryDto,
  AdminListMetricTypesQueryDto,
  AssignWorkoutProgramDto,
  CreateAthleteDataGrantDto,
  CreateExerciseDto,
  CreateMetricGoalDto,
  CreateMetricTypeDto,
  CreatePersonalRecordDto,
  CreateProgressMetricDto,
  CreateProgressPhotoDto,
  CreateWorkoutLogDto,
  CreateWorkoutPlanDto,
  CreateWorkoutProgramDto,
  DeleteProgressMetricsDto,
  ListAthleteDataGrantsQueryDto,
  ListExercisesQueryDto,
  ListHealthSyncStatesQueryDto,
  ListMetricGoalsQueryDto,
  ListMetricRemindersQueryDto,
  ListMetricTypesQueryDto,
  ListPersonalRecordsQueryDto,
  ListProgressMetricsQueryDto,
  ListProgressPhotosQueryDto,
  ListWorkoutLogsQueryDto,
  ListWorkoutPlansQueryDto,
  ListWorkoutProgramsQueryDto,
  ReviewWorkoutLogDto,
  MetricsSummaryQueryDto,
  ReviewExerciseVerificationDto,
  SyncProgressMetricItemDto,
  SyncProgressMetricsDto,
  UpdateExerciseDto,
  UpdateMetricGoalDto,
  UpdateMetricTypeDto,
  UpdateProgressMetricDto,
  UpdateProgressPhotoDto,
  UpdateWorkoutLogDto,
  UpdateWorkoutPlanDto,
  UpdateWorkoutProgramDto,
  UpsertHealthSyncStateDto,
  UpsertMetricReminderDto,
  WorkoutPlanWeekDto,
} from './dto/progress.dto';
import {
  grantAllowsScope,
  metricKeysAllowedByGrant,
} from './data-grant.policy';
import { ListProgressMetricsQuery } from './application/queries/list-progress-metrics.query';
import { projectProgressMetric } from './application/projectors/progress-metric.projector';
import { buildHealthSyncStateUpdate } from './health-sync-state-update';
import {
  healthProviderForMetricSource,
  healthSyncIngestionRejection,
  type HealthSyncAuthorizationState,
} from './health-sync-ingestion.policy';

const HEALTH_METRIC_SOURCES = new Set<MetricSource>([
  MetricSource.APPLE_HEALTH,
  MetricSource.HEALTH_CONNECT,
]);

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

const DEFAULT_METRIC_TYPES: {
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit?: string;
  canonicalUnit?: string;
  sortHint: number;
  chartKind?: string;
  aggregation: MetricAggregation;
  periodKind: MetricPeriodKind;
  privacyClass: MetricPrivacyClass;
  validation?: { min?: number; max?: number; step?: number; integer?: boolean };
}[] = [
  {
    key: 'weight_kg',
    name: 'Weight',
    valueKind: MetricValueKind.NUMBER,
    unit: 'kg',
    canonicalUnit: 'kg',
    sortHint: 10,
    chartKind: 'line',
    aggregation: MetricAggregation.LATEST,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.HEALTH,
    validation: { min: 1, max: 500 },
  },
  {
    key: 'height_cm',
    name: 'Height',
    valueKind: MetricValueKind.NUMBER,
    unit: 'cm',
    canonicalUnit: 'cm',
    sortHint: 11,
    chartKind: 'line',
    aggregation: MetricAggregation.LATEST,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.HEALTH,
    validation: { min: 50, max: 250 },
  },
  {
    key: 'heart_rate',
    name: 'Heart rate',
    valueKind: MetricValueKind.NUMBER,
    unit: 'bpm',
    canonicalUnit: 'bpm',
    sortHint: 20,
    chartKind: 'line',
    aggregation: MetricAggregation.AVERAGE,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.HEALTH,
    validation: { min: 30, max: 250, integer: true },
  },
  {
    key: 'hydration',
    name: 'Hydration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'L',
    canonicalUnit: 'L',
    sortHint: 30,
    chartKind: 'stacked',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
  },
  {
    key: 'water_ml',
    name: 'Water intake',
    valueKind: MetricValueKind.NUMBER,
    unit: 'ml',
    canonicalUnit: 'ml',
    sortHint: 31,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 0, max: 20_000, step: 50 },
  },
  {
    key: 'blood_pressure',
    name: 'Blood pressure',
    valueKind: MetricValueKind.PAIR,
    unit: 'mmHg',
    canonicalUnit: 'mmHg',
    sortHint: 40,
    chartKind: 'range',
    aggregation: MetricAggregation.LATEST,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.SENSITIVE,
  },
  {
    key: 'sleep',
    name: 'Sleep',
    valueKind: MetricValueKind.RATIO,
    unit: 'h',
    canonicalUnit: 'h',
    sortHint: 50,
    chartKind: 'rings',
    aggregation: MetricAggregation.AVERAGE,
    periodKind: MetricPeriodKind.INTERVAL,
    privacyClass: MetricPrivacyClass.HEALTH,
  },
  {
    key: 'sleep_duration_min',
    name: 'Sleep duration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'min',
    canonicalUnit: 'min',
    sortHint: 51,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.INTERVAL,
    privacyClass: MetricPrivacyClass.HEALTH,
    validation: { min: 0, max: 1_440 },
  },
  {
    key: 'sleep_quality',
    name: 'Sleep quality',
    valueKind: MetricValueKind.NUMBER,
    unit: 'score',
    canonicalUnit: 'score',
    sortHint: 52,
    chartKind: 'line',
    aggregation: MetricAggregation.AVERAGE,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 1, max: 5, integer: true },
  },
  {
    key: 'nutrition',
    name: 'Nutrition',
    valueKind: MetricValueKind.NUMBER,
    sortHint: 60,
    chartKind: 'dots',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
  },
  {
    key: 'calories_kcal',
    name: 'Calories',
    valueKind: MetricValueKind.NUMBER,
    unit: 'kcal',
    canonicalUnit: 'kcal',
    sortHint: 61,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 0, max: 20_000 },
  },
  {
    key: 'mood',
    name: 'Mood',
    valueKind: MetricValueKind.TEXT,
    sortHint: 70,
    chartKind: 'moods',
    aggregation: MetricAggregation.LATEST,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.SENSITIVE,
  },
  {
    key: 'steps',
    name: 'Steps',
    valueKind: MetricValueKind.NUMBER,
    unit: 'count',
    canonicalUnit: 'count',
    sortHint: 80,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 0, max: 200_000, integer: true },
  },
  {
    key: 'walking_distance_km',
    name: 'Walking distance',
    valueKind: MetricValueKind.NUMBER,
    unit: 'km',
    canonicalUnit: 'km',
    sortHint: 81,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.DAILY_TOTAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 0, max: 500 },
  },
  {
    key: 'walking_duration_min',
    name: 'Walking duration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'min',
    canonicalUnit: 'min',
    sortHint: 82,
    chartKind: 'bars',
    aggregation: MetricAggregation.SUM,
    periodKind: MetricPeriodKind.INTERVAL,
    privacyClass: MetricPrivacyClass.WELLNESS,
    validation: { min: 0, max: 1_440 },
  },
  {
    key: 'respiration',
    name: 'Respiration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'rpm',
    canonicalUnit: 'rpm',
    sortHint: 90,
    chartKind: 'line',
    aggregation: MetricAggregation.AVERAGE,
    periodKind: MetricPeriodKind.POINT,
    privacyClass: MetricPrivacyClass.HEALTH,
  },
];

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Exercise.name)
    private readonly exerciseModel: Model<ExerciseDocument>,
    @InjectModel(WorkoutPlan.name)
    private readonly workoutPlanModel: Model<WorkoutPlanDocument>,
    @InjectModel(WorkoutProgram.name)
    private readonly workoutProgramModel: Model<WorkoutProgramDocument>,
    @InjectModel(ProgressMetric.name)
    private readonly metricModel: Model<ProgressMetricDocument>,
    @InjectModel(ProgressPhoto.name)
    private readonly photoModel: Model<ProgressPhotoDocument>,
    @InjectModel(MetricType.name)
    private readonly metricTypeModel: Model<MetricTypeDocument>,
    @InjectModel(WorkoutLog.name)
    private readonly workoutLogModel: Model<WorkoutLogDocument>,
    @InjectModel(PersonalRecord.name)
    private readonly personalRecordModel: Model<PersonalRecordDocument>,
    @InjectModel(CoachStudent.name)
    private readonly coachStudentModel: Model<CoachStudentDocument>,
    @InjectModel(AthleteDataGrant.name)
    private readonly dataGrantModel: Model<AthleteDataGrantDocument>,
    @InjectModel(MetricGoal.name)
    private readonly metricGoalModel: Model<MetricGoalDocument>,
    @InjectModel(MetricReminder.name)
    private readonly metricReminderModel: Model<MetricReminderDocument>,
    @InjectModel(HealthSyncState.name)
    private readonly healthSyncStateModel: Model<HealthSyncStateDocument>,
    private readonly audit: AuditService,
    private readonly events: EventWriterService,
    private readonly listProgressMetrics: ListProgressMetricsQuery,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
  ) {}

  // ── Exercises ───────────────────────────────────────────────────────────

  async adminListExercises(query: AdminListExercisesQueryDto) {
    const filter: QueryFilter<ExerciseDocument> = {};
    if (query.status?.length) {
      filter.status =
        query.status.length === 1 ? query.status[0] : { $in: query.status };
    }
    if (query.search) {
      filter.name = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
    }
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.exerciseModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.exerciseModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toExercise(item)),
      total,
      page,
      pageSize,
    );
  }

  async adminGetExercise(id: string) {
    const item = await this.findExercise(id);
    return this.toExercise(item.toObject());
  }

  async adminCreateExercise(
    dto: CreateExerciseDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.exerciseModel.create({
      name: dto.name.trim(),
      description: dto.description?.trim(),
      muscleKeys: dto.muscleKeys ?? [],
      equipmentKeys: dto.equipmentKeys ?? [],
      mediaId: dto.mediaId ? new Types.ObjectId(dto.mediaId) : undefined,
      status: dto.status ?? ExerciseStatus.ACTIVE,
      origin: {
        kind: ExerciseOriginKind.ADMIN,
        userId: new Types.ObjectId(adminId),
      },
      verification: { status: VerificationStatus.APPROVED },
    });
    this.audit.log({
      action: AuditAction.EXERCISE_VERIFIED,
      actorId: adminId,
      metadata: { kind: 'exercise', exerciseId: item._id.toString() },
      request,
    });
    return this.toExercise(item.toObject());
  }

  async adminUpdateExercise(
    id: string,
    dto: UpdateExerciseDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findExercise(id);
    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.description !== undefined)
      item.description = dto.description?.trim() || undefined;
    if (dto.muscleKeys !== undefined) item.muscleKeys = dto.muscleKeys;
    if (dto.equipmentKeys !== undefined) item.equipmentKeys = dto.equipmentKeys;
    if (dto.mediaId !== undefined) {
      item.mediaId = dto.mediaId ? new Types.ObjectId(dto.mediaId) : undefined;
    }
    if (dto.status !== undefined) item.status = dto.status;
    await item.save();
    this.audit.log({
      action: AuditAction.EXERCISE_UPSERTED,
      actorId: adminId,
      metadata: { kind: 'exercise', exerciseId: id },
      request,
    });
    return this.toExercise(item.toObject());
  }

  async adminArchiveExercise(id: string, adminId: string, request: Request) {
    const item = await this.findExercise(id);
    item.status = ExerciseStatus.ARCHIVED;
    await item.save();
    this.audit.log({
      action: AuditAction.EXERCISE_UPSERTED,
      actorId: adminId,
      metadata: { kind: 'exercise_archive', exerciseId: id },
      request,
    });
    return this.toExercise(item.toObject());
  }

  /** Active + approved exercise bank for coaches / athletes. */
  async listExercises(query: ListExercisesQueryDto) {
    const filter: QueryFilter<ExerciseDocument> = {
      status: query.status ?? ExerciseStatus.ACTIVE,
      $or: [
        { 'verification.status': VerificationStatus.APPROVED },
        { verification: { $exists: false } },
      ],
    };
    if (query.search) {
      filter.name = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
    }
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.exerciseModel
        .find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.exerciseModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toExercise(item)),
      total,
      page,
      pageSize,
    );
  }

  async coachSubmitExercise(
    dto: CreateExerciseDto,
    coachId: string,
    request: Request,
  ) {
    const item = await this.exerciseModel.create({
      name: dto.name.trim(),
      description: dto.description?.trim(),
      muscleKeys: dto.muscleKeys ?? [],
      equipmentKeys: dto.equipmentKeys ?? [],
      mediaId: dto.mediaId ? new Types.ObjectId(dto.mediaId) : undefined,
      status: ExerciseStatus.ACTIVE,
      origin: {
        kind: ExerciseOriginKind.COACH,
        userId: new Types.ObjectId(coachId),
      },
      verification: { status: VerificationStatus.PENDING },
    });
    this.audit.log({
      action: AuditAction.EXERCISE_SUBMITTED,
      actorId: coachId,
      metadata: { exerciseId: item._id.toString() },
      request,
    });
    return this.toExercise(item.toObject());
  }

  async adminReviewExercise(
    id: string,
    dto: ReviewExerciseVerificationDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findExercise(id);
    if (
      dto.status !== VerificationStatus.APPROVED &&
      dto.status !== VerificationStatus.REJECTED
    ) {
      throw new BadRequestException('status must be approved or rejected');
    }
    item.verification = {
      status: dto.status,
      reviewedBy: new Types.ObjectId(adminId),
      reviewedAt: new Date(),
      rejectionReason:
        dto.status === VerificationStatus.REJECTED
          ? dto.rejectionReason?.trim()
          : undefined,
    };
    if (dto.status === VerificationStatus.REJECTED) {
      item.status = ExerciseStatus.ARCHIVED;
    }
    await item.save();
    this.audit.log({
      action: AuditAction.EXERCISE_VERIFIED,
      actorId: adminId,
      metadata: {
        exerciseId: id,
        verification: dto.status,
      },
      request,
    });
    return this.toExercise(item.toObject());
  }

  // ── Workout plans ───────────────────────────────────────────────────────

  async listWorkoutPlans(
    userId: string,
    activeRole: Role,
    query: ListWorkoutPlansQueryDto,
  ) {
    const filter = await this.workoutPlanAccessFilter(
      userId,
      activeRole,
      query,
    );
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.workoutPlanModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.workoutPlanModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toWorkoutPlan(item)),
      total,
      page,
      pageSize,
    );
  }

  async getWorkoutPlan(id: string, userId: string, activeRole: Role) {
    const item = await this.findWorkoutPlan(id);
    await this.assertWorkoutPlanAccess(item, userId, activeRole);
    return this.toWorkoutPlan(item.toObject());
  }

  async getWorkoutPlanRevision(
    id: string,
    revisionId: string,
    userId: string,
    activeRole: Role,
  ) {
    if (!Types.ObjectId.isValid(revisionId)) {
      throw new NotFoundException('Workout plan revision not found');
    }
    const item = await this.findWorkoutPlan(id);
    await this.assertWorkoutPlanAccess(item, userId, activeRole);
    const revision = (item.revisions ?? []).find(
      (candidate) => candidate._id.toString() === revisionId,
    );
    if (!revision) {
      throw new NotFoundException('Workout plan revision not found');
    }
    return this.toWorkoutPlanRevision(revision);
  }

  async createWorkoutPlan(
    dto: CreateWorkoutPlanDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const athleteUserId = this.resolveAthleteUserId(
      dto.athleteUserId,
      userId,
      activeRole,
    );
    const coachUserId =
      activeRole === Role.COACH ? new Types.ObjectId(userId) : undefined;
    if (activeRole === Role.COACH) {
      await this.assertCoachStudent(userId, athleteUserId);
    }

    const revisionId = new Types.ObjectId();
    const title = dto.title.trim();
    const weeks = this.mapWeeks(dto.weeks ?? []);
    const period = this.mapPeriod(dto.period);
    const item = await this.workoutPlanModel.create({
      athleteUserId: new Types.ObjectId(athleteUserId),
      coachUserId,
      title,
      status: dto.status ?? WorkoutPlanStatus.DRAFT,
      privacy: dto.privacy ?? Privacy.PRIVATE,
      weeks,
      period,
      currentRevisionId: revisionId,
      currentRevision: 1,
      revisions: [
        {
          _id: revisionId,
          revision: 1,
          title,
          weeks,
          period,
          createdByUserId: new Types.ObjectId(userId),
          createdAt: new Date(),
        },
      ],
    });

    this.audit.log({
      action: AuditAction.PROGRESS_METRIC_UPSERTED,
      actorId: userId,
      targetUserId: athleteUserId,
      metadata: { workoutPlanId: item._id.toString() },
      request,
    });
    return this.toWorkoutPlan(item.toObject());
  }

  async updateWorkoutPlan(
    id: string,
    dto: UpdateWorkoutPlanDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findWorkoutPlan(id);
    await this.assertWorkoutPlanAccess(item, userId, activeRole);

    const prescriptionChanged =
      dto.title !== undefined ||
      dto.weeks !== undefined ||
      dto.period !== undefined;

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    if (dto.weeks !== undefined) item.weeks = this.mapWeeks(dto.weeks);
    if (dto.period !== undefined) {
      item.period =
        dto.period === null ? undefined : this.mapPeriod(dto.period);
    }
    if (prescriptionChanged) {
      this.appendWorkoutPlanRevision(item, userId);
    }
    await item.save();

    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
      actorId: userId,
      targetUserId: item.athleteUserId,
      metadata: { workoutPlanId: id },
      request,
    });
    return this.toWorkoutPlan(item.toObject());
  }

  async deleteWorkoutPlan(
    id: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findWorkoutPlan(id);
    await this.assertWorkoutPlanAccess(item, userId, activeRole);
    item.status = WorkoutPlanStatus.ARCHIVED;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
      actorId: userId,
      targetUserId: item.athleteUserId,
      metadata: { kind: 'archive', workoutPlanId: id },
      request,
    });
    return this.toWorkoutPlan(item.toObject());
  }

  // ── Metrics ─────────────────────────────────────────────────────────────

  async listMetrics(
    userId: string,
    activeRole: Role,
    query: ListProgressMetricsQueryDto,
  ) {
    const athleteUserId = await this.resolveProgressAthleteId(
      userId,
      activeRole,
      query.athleteUserId,
      'metrics',
    );
    let allowedMetricKeys: string[] | undefined;
    if (query.metricKey) {
      await this.assertCoachMetricScopeIfNeeded(
        userId,
        activeRole,
        athleteUserId,
        [query.metricKey],
      );
    } else if (activeRole === Role.COACH) {
      allowedMetricKeys = await this.coachAllowedMetricKeys(
        userId,
        athleteUserId,
      );
    }
    return this.listProgressMetrics.execute(
      athleteUserId,
      query,
      allowedMetricKeys,
    );
  }

  async metricsSummary(
    userId: string,
    activeRole: Role,
    query: MetricsSummaryQueryDto,
  ) {
    const athleteUserId = await this.resolveProgressAthleteId(
      userId,
      activeRole,
      query.athleteUserId,
      'metrics',
    );
    let metricKeys = (query.metricKeys ?? [])
      .map((k) => k.trim())
      .filter(Boolean);
    if (activeRole === Role.COACH) {
      const allowed = await this.coachAllowedMetricKeys(userId, athleteUserId);
      metricKeys =
        metricKeys.length > 0
          ? metricKeys.filter((k) => allowed.includes(k))
          : allowed;
      if (metricKeys.length === 0) {
        return { from: query.from ?? null, to: query.to ?? null, items: [] };
      }
    }
    await this.ensureDefaultMetricTypes();
    const typeFilter: QueryFilter<MetricTypeDocument> = {
      status: MetricTypeStatus.ACTIVE,
    };
    if (metricKeys.length > 0) typeFilter.key = { $in: metricKeys };
    const types = await this.metricTypeModel.find(typeFilter).lean();
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    if (from && to && from > to) {
      throw new BadRequestException('from must be before to');
    }
    const items = await Promise.all(
      types.map(async (type) => {
        const filter: QueryFilter<ProgressMetricDocument> = {
          athleteUserId: new Types.ObjectId(athleteUserId),
          metricKey: type.key,
        };
        if (from || to) {
          filter.recordedAt = {
            ...(from ? { $gte: from } : {}),
            ...(to ? { $lte: to } : {}),
          };
        }
        const samples = await this.metricModel
          .find(filter)
          .sort({ recordedAt: -1 })
          .lean();
        const values = samples.map((s) => s.value);
        const aggregated = this.aggregateValues(
          type.aggregation ?? MetricAggregation.LATEST,
          values,
        );
        return {
          metricKey: type.key,
          aggregation: type.aggregation ?? MetricAggregation.LATEST,
          unit: type.canonicalUnit ?? type.unit ?? null,
          sampleCount: values.length,
          value: aggregated,
          latestRecordedAt: samples[0]?.recordedAt?.toISOString() ?? null,
        };
      }),
    );
    return {
      from: query.from ?? null,
      to: query.to ?? null,
      items,
    };
  }

  async createMetric(
    dto: CreateProgressMetricDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    this.assertAthleteOnlyWrite(activeRole, 'create');
    if (
      dto.source === MetricSource.APPLE_HEALTH ||
      dto.source === MetricSource.HEALTH_CONNECT
    ) {
      throw new BadRequestException(
        'Health-provider samples must use the idempotent sync endpoint',
      );
    }
    await this.assertMetricValue(dto.metricKey, dto.value);
    const period = this.resolveMetricPeriod(dto);
    if (dto.clientMutationId) {
      const existing = await this.metricModel
        .findOne({
          athleteUserId: new Types.ObjectId(userId),
          clientMutationId: dto.clientMutationId.trim(),
        })
        .lean();
      if (existing) return this.toMetric(existing);
    }
    const item = await this.metricModel.create({
      athleteUserId: new Types.ObjectId(userId),
      privacy: dto.privacy ?? Privacy.PRIVATE,
      metricKey: dto.metricKey.trim(),
      value: dto.value,
      unit: dto.unit?.trim(),
      recordedAt: new Date(dto.recordedAt),
      note: dto.note?.trim(),
      source: dto.source ?? MetricSource.MANUAL,
      sourceRecordId: dto.sourceRecordId?.trim(),
      clientMutationId: dto.clientMutationId?.trim(),
      period,
      periodStartAt: period?.start,
      periodEndAt: period?.end,
    });
    this.audit.log({
      action: AuditAction.PROGRESS_METRIC_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric', metricId: item._id.toString() },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.METRIC_LOGGED,
      actor: { userId, activeRole },
      properties: {
        metricKey: item.metricKey,
        source: item.source,
        hasClientMutationId: Boolean(item.clientMutationId),
      },
    });
    return this.toMetric(item.toObject());
  }

  async syncMetrics(
    dto: SyncProgressMetricsDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    this.assertAthleteOnlyWrite(activeRole, 'sync');
    const athleteUserId = new Types.ObjectId(userId);
    const requestedProviders = [
      ...new Set(
        dto.entries
          .map((entry) => healthProviderForMetricSource(entry.source))
          .filter((provider): provider is HealthSyncProvider =>
            Boolean(provider),
          ),
      ),
    ];
    const healthStates = new Map<
      HealthSyncProvider,
      HealthSyncAuthorizationState
    >();
    if (requestedProviders.length > 0) {
      const states = await this.healthSyncStateModel
        .find({ athleteUserId, provider: { $in: requestedProviders } })
        .lean();
      for (const state of states) {
        healthStates.set(state.provider, {
          provider: state.provider,
          status: state.status,
          authorizedMetricKeys: state.authorizedMetricKeys ?? [],
        });
      }
    }
    let created = 0;
    let deduplicated = 0;
    const rejected: {
      index: number;
      reason: string;
      clientMutationId?: string;
      sourceRecordId?: string;
    }[] = [];

    for (let index = 0; index < dto.entries.length; index++) {
      const entry = dto.entries[index];
      try {
        const healthRejection = healthSyncIngestionRejection({
          source: entry.source,
          metricKey: entry.metricKey,
          states: healthStates,
        });
        if (healthRejection) throw new ForbiddenException(healthRejection);
        await this.assertMetricValue(entry.metricKey, entry.value);
        const period = this.resolveMetricPeriod(entry);
        if (!entry.sourceRecordId?.trim() && !entry.clientMutationId?.trim()) {
          throw new BadRequestException(
            'sourceRecordId or clientMutationId is required',
          );
        }
        const filter = this.syncDedupeFilter(athleteUserId, entry);
        const result = await this.metricModel.updateOne(
          filter,
          {
            $setOnInsert: {
              athleteUserId,
              privacy: entry.privacy ?? Privacy.PRIVATE,
              metricKey: entry.metricKey.trim(),
              value: entry.value,
              unit: entry.unit?.trim(),
              recordedAt: new Date(entry.recordedAt),
              note: entry.note?.trim(),
              source: entry.source,
              sourceRecordId: entry.sourceRecordId?.trim(),
              clientMutationId: entry.clientMutationId?.trim(),
              period,
              periodStartAt: period?.start,
              periodEndAt: period?.end,
            },
          },
          { upsert: true },
        );
        if (result.upsertedCount > 0) created += 1;
        else deduplicated += 1;
      } catch (err) {
        if (isDuplicateKeyError(err)) {
          deduplicated += 1;
          continue;
        }
        rejected.push({
          index,
          reason:
            err instanceof Error ? err.message : 'Failed to sync metric entry',
          clientMutationId: entry.clientMutationId,
          sourceRecordId: entry.sourceRecordId,
        });
      }
    }

    this.audit.log({
      action: AuditAction.PROGRESS_METRIC_SYNCED,
      actorId: userId,
      metadata: {
        kind: 'metric_sync',
        accepted: dto.entries.length - rejected.length,
        created,
        deduplicated,
        rejected: rejected.length,
      },
      request,
    });

    const providers = [...new Set(dto.entries.map((entry) => entry.source))];
    const isHealthSync = providers.some((provider) =>
      HEALTH_METRIC_SOURCES.has(provider),
    );
    if (isHealthSync && (created > 0 || deduplicated > 0)) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_COMPLETED,
        actor: { userId, activeRole },
        properties: {
          created,
          deduplicated,
          rejected: rejected.length,
          providers,
        },
      });
    }
    if (
      isHealthSync &&
      rejected.length > 0 &&
      created === 0 &&
      deduplicated === 0
    ) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_FAILED,
        actor: { userId, activeRole },
        properties: {
          rejected: rejected.length,
          providers,
        },
      });
    }

    return {
      accepted: dto.entries.length - rejected.length,
      created,
      deduplicated,
      rejected,
    };
  }

  async updateMetric(
    id: string,
    dto: UpdateProgressMetricDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findMetric(id);
    this.assertOwnerOrAdmin(item.athleteUserId, userId, activeRole);
    if (dto.metricKey !== undefined) item.metricKey = dto.metricKey.trim();
    if (dto.value !== undefined) {
      await this.assertMetricValue(dto.metricKey ?? item.metricKey, dto.value);
      item.value = dto.value;
    } else if (dto.metricKey !== undefined) {
      await this.assertMetricValue(dto.metricKey, item.value);
    }
    if (dto.unit !== undefined) item.unit = dto.unit?.trim() || undefined;
    if (dto.recordedAt !== undefined)
      item.recordedAt = new Date(dto.recordedAt);
    if (dto.note !== undefined) item.note = dto.note?.trim() || undefined;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    await item.save();
    this.audit.log({
      action: AuditAction.PROGRESS_METRIC_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric', metricId: id },
      request,
    });
    return this.toMetric(item.toObject());
  }

  async deleteMetric(
    id: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findMetric(id);
    this.assertOwnerOrAdmin(item.athleteUserId, userId, activeRole);
    await item.deleteOne();
    this.audit.log({
      action: AuditAction.PROGRESS_METRIC_DELETED,
      actorId: userId,
      metadata: { kind: 'metric_delete', metricId: id },
      request,
    });
    return { ok: true };
  }

  // ── Photos ──────────────────────────────────────────────────────────────

  async listPhotos(
    userId: string,
    activeRole: Role,
    query: ListProgressPhotosQueryDto,
  ) {
    this.assertAthleteOnlyWrite(activeRole, 'list');
    const filter: QueryFilter<ProgressPhotoDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.photoModel
        .find(filter)
        .sort({ capturedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.photoModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toPhoto(item)),
      total,
      page,
      pageSize,
    );
  }

  async createPhoto(
    dto: CreateProgressPhotoDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    this.assertAthleteOnlyWrite(activeRole, 'create');
    const item = await this.photoModel.create({
      athleteUserId: new Types.ObjectId(userId),
      mediaId: new Types.ObjectId(dto.mediaId),
      privacy: dto.privacy ?? Privacy.PRIVATE,
      capturedAt: new Date(dto.capturedAt),
      note: dto.note?.trim(),
    });
    this.audit.log({
      action: AuditAction.PROGRESS_PHOTO_UPSERTED,
      actorId: userId,
      metadata: { kind: 'photo', photoId: item._id.toString() },
      request,
    });
    return this.toPhoto(item.toObject());
  }

  async updatePhoto(
    id: string,
    dto: UpdateProgressPhotoDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findPhoto(id);
    this.assertOwnerOrAdmin(item.athleteUserId, userId, activeRole);
    if (dto.mediaId !== undefined)
      item.mediaId = new Types.ObjectId(dto.mediaId);
    if (dto.capturedAt !== undefined)
      item.capturedAt = new Date(dto.capturedAt);
    if (dto.note !== undefined) item.note = dto.note?.trim() || undefined;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    await item.save();
    this.audit.log({
      action: AuditAction.PROGRESS_PHOTO_UPSERTED,
      actorId: userId,
      metadata: { kind: 'photo', photoId: id },
      request,
    });
    return this.toPhoto(item.toObject());
  }

  async deletePhoto(
    id: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findPhoto(id);
    this.assertOwnerOrAdmin(item.athleteUserId, userId, activeRole);
    await item.deleteOne();
    this.audit.log({
      action: AuditAction.PROGRESS_PHOTO_DELETED,
      actorId: userId,
      metadata: { kind: 'photo_delete', photoId: id },
      request,
    });
    return { ok: true };
  }

  // ── Metric types ────────────────────────────────────────────────────────

  async adminListMetricTypes(query: AdminListMetricTypesQueryDto) {
    await this.ensureDefaultMetricTypes();
    const filter: QueryFilter<MetricTypeDocument> = {};
    if (query.status?.length) {
      filter.status =
        query.status.length === 1 ? query.status[0] : { $in: query.status };
    }
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { key: new RegExp(escaped, 'i') },
        { name: new RegExp(escaped, 'i') },
      ];
    }
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricTypeModel
        .find(filter)
        .sort({ sortHint: 1, key: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricTypeModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMetricType(item)),
      total,
      page,
      pageSize,
    );
  }

  async adminGetMetricType(id: string) {
    const item = await this.findMetricType(id);
    return this.toMetricType(item.toObject());
  }

  async adminCreateMetricType(
    dto: CreateMetricTypeDto,
    adminId: string,
    request: Request,
  ) {
    const key = dto.key.trim().toLowerCase();
    try {
      const item = await this.metricTypeModel.create({
        key,
        name: dto.name.trim(),
        valueKind: dto.valueKind,
        unit: dto.unit?.trim() ?? dto.canonicalUnit?.trim(),
        canonicalUnit: dto.canonicalUnit?.trim() ?? dto.unit?.trim(),
        validation: dto.validation,
        aggregation: dto.aggregation ?? MetricAggregation.LATEST,
        periodKind: dto.periodKind ?? MetricPeriodKind.POINT,
        privacyClass: dto.privacyClass ?? MetricPrivacyClass.WELLNESS,
        sourceMappings: dto.sourceMappings,
        sportId: dto.sportId?.trim(),
        status: dto.status ?? MetricTypeStatus.ACTIVE,
        sortHint: dto.sortHint ?? 100,
        chartKind: dto.chartKind?.trim(),
      });
      this.audit.log({
        action: AuditAction.METRIC_TYPE_UPSERTED,
        actorId: adminId,
        metadata: { metricTypeId: item._id.toString(), key, op: 'create' },
        request,
      });
      return this.toMetricType(item.toObject());
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new BadRequestException(`Metric type key already exists: ${key}`);
      }
      throw err;
    }
  }

  async adminUpdateMetricType(
    id: string,
    dto: UpdateMetricTypeDto,
    adminId: string,
    request: Request,
  ) {
    const item = await this.findMetricType(id);
    if (dto.name !== undefined) item.name = dto.name.trim();
    if (dto.valueKind !== undefined) item.valueKind = dto.valueKind;
    if (dto.unit !== undefined) item.unit = dto.unit?.trim() || undefined;
    if (dto.canonicalUnit !== undefined) {
      item.canonicalUnit = dto.canonicalUnit?.trim() || undefined;
    }
    if (dto.validation !== undefined) {
      item.validation = dto.validation ?? undefined;
      item.markModified('validation');
    }
    if (dto.aggregation !== undefined) item.aggregation = dto.aggregation;
    if (dto.periodKind !== undefined) item.periodKind = dto.periodKind;
    if (dto.privacyClass !== undefined) item.privacyClass = dto.privacyClass;
    if (dto.sourceMappings !== undefined) {
      item.sourceMappings = dto.sourceMappings ?? undefined;
      item.markModified('sourceMappings');
    }
    if (dto.sportId !== undefined)
      item.sportId = dto.sportId?.trim() || undefined;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.sortHint !== undefined) item.sortHint = dto.sortHint;
    if (dto.chartKind !== undefined)
      item.chartKind = dto.chartKind?.trim() || undefined;
    await item.save();
    this.audit.log({
      action: AuditAction.METRIC_TYPE_UPSERTED,
      actorId: adminId,
      metadata: { metricTypeId: id, op: 'update' },
      request,
    });
    return this.toMetricType(item.toObject());
  }

  async adminArchiveMetricType(id: string, adminId: string, request: Request) {
    const item = await this.findMetricType(id);
    item.status = MetricTypeStatus.ARCHIVED;
    await item.save();
    this.audit.log({
      action: AuditAction.METRIC_TYPE_UPSERTED,
      actorId: adminId,
      metadata: { metricTypeId: id, op: 'archive' },
      request,
    });
    return this.toMetricType(item.toObject());
  }

  /** Active catalog for athletes/coaches; seeds defaults when empty. */
  async listActiveMetricTypes(query: ListMetricTypesQueryDto) {
    await this.ensureDefaultMetricTypes();
    const filter: QueryFilter<MetricTypeDocument> = {
      status: MetricTypeStatus.ACTIVE,
    };
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { key: new RegExp(escaped, 'i') },
        { name: new RegExp(escaped, 'i') },
      ];
    }
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricTypeModel
        .find(filter)
        .sort({ sortHint: 1, key: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricTypeModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMetricType(item)),
      total,
      page,
      pageSize,
    );
  }

  // ── Workout programs ────────────────────────────────────────────────────

  async listWorkoutPrograms(
    coachUserId: string,
    query: ListWorkoutProgramsQueryDto,
  ) {
    const filter: QueryFilter<WorkoutProgramDocument> = {
      'owner.type': WorkoutProgramOwnerType.COACH,
      'owner.id': new Types.ObjectId(coachUserId),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.workoutProgramModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.workoutProgramModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toWorkoutProgram(item)),
      total,
      page,
      pageSize,
    );
  }

  async getWorkoutProgram(id: string, coachUserId: string) {
    const item = await this.findOwnedWorkoutProgram(id, coachUserId);
    return this.toWorkoutProgram(item.toObject());
  }

  async createWorkoutProgram(
    dto: CreateWorkoutProgramDto,
    coachUserId: string,
    request: Request,
  ) {
    const item = await this.workoutProgramModel.create({
      owner: {
        type: WorkoutProgramOwnerType.COACH,
        id: new Types.ObjectId(coachUserId),
      },
      title: dto.title.trim(),
      status: dto.status ?? WorkoutProgramStatus.DRAFT,
      privacy: dto.privacy ?? Privacy.PRIVATE,
      meta: {
        focusLabel: dto.meta?.focusLabel?.trim(),
        weekCount: dto.meta?.weekCount,
        sessionsPerWeek: dto.meta?.sessionsPerWeek,
      },
      weeks: this.mapWeeks(dto.weeks ?? []),
      assignedCount: 0,
    });
    this.audit.log({
      action: AuditAction.WORKOUT_PROGRAM_UPSERTED,
      actorId: coachUserId,
      metadata: { workoutProgramId: item._id.toString(), op: 'create' },
      request,
    });
    return this.toWorkoutProgram(item.toObject());
  }

  async updateWorkoutProgram(
    id: string,
    dto: UpdateWorkoutProgramDto,
    coachUserId: string,
    request: Request,
  ) {
    const item = await this.findOwnedWorkoutProgram(id, coachUserId);
    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    if (dto.meta !== undefined) {
      item.meta = {
        focusLabel: dto.meta.focusLabel?.trim(),
        weekCount: dto.meta.weekCount,
        sessionsPerWeek: dto.meta.sessionsPerWeek,
      };
      item.markModified('meta');
    }
    if (dto.weeks !== undefined) item.weeks = this.mapWeeks(dto.weeks);
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_PROGRAM_UPSERTED,
      actorId: coachUserId,
      metadata: { workoutProgramId: id, op: 'update' },
      request,
    });
    return this.toWorkoutProgram(item.toObject());
  }

  async archiveWorkoutProgram(
    id: string,
    coachUserId: string,
    request: Request,
  ) {
    const item = await this.findOwnedWorkoutProgram(id, coachUserId);
    item.status = WorkoutProgramStatus.ARCHIVED;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_PROGRAM_UPSERTED,
      actorId: coachUserId,
      metadata: { workoutProgramId: id, op: 'archive' },
      request,
    });
    return this.toWorkoutProgram(item.toObject());
  }

  async assignWorkoutProgram(
    id: string,
    dto: AssignWorkoutProgramDto,
    coachUserId: string,
    request: Request,
  ) {
    const program = await this.findOwnedWorkoutProgram(id, coachUserId);
    if (program.status === WorkoutProgramStatus.ARCHIVED) {
      throw new BadRequestException('Cannot assign an archived program');
    }
    await this.assertCoachStudent(coachUserId, dto.athleteUserId);

    const revisionId = new Types.ObjectId();
    const title = program.title;
    const weeks = program.weeks ?? [];
    const period = this.mapPeriod(dto.period);
    const plan = await this.workoutPlanModel.create({
      athleteUserId: new Types.ObjectId(dto.athleteUserId),
      coachUserId: new Types.ObjectId(coachUserId),
      programId: program._id,
      title,
      status: dto.status ?? WorkoutPlanStatus.ACTIVE,
      privacy: dto.privacy ?? program.privacy ?? Privacy.PRIVATE,
      weeks,
      period,
      currentRevisionId: revisionId,
      currentRevision: 1,
      revisions: [
        {
          _id: revisionId,
          revision: 1,
          title,
          weeks,
          period,
          createdByUserId: new Types.ObjectId(coachUserId),
          createdAt: new Date(),
        },
      ],
    });

    await this.workoutProgramModel.updateOne(
      { _id: program._id },
      { $inc: { assignedCount: 1 } },
    );

    this.audit.log({
      action: AuditAction.WORKOUT_PROGRAM_UPSERTED,
      actorId: coachUserId,
      targetUserId: dto.athleteUserId,
      metadata: {
        workoutProgramId: id,
        workoutPlanId: plan._id.toString(),
        op: 'assign',
      },
      request,
    });

    return this.toWorkoutPlan(plan.toObject());
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private resolveAthleteUserId(
    athleteUserId: string | undefined,
    userId: string,
    activeRole: Role,
  ): string {
    if (activeRole === Role.ATHLETE) {
      if (athleteUserId && athleteUserId !== userId) {
        throw new ForbiddenException(
          'Athletes can only manage their own plans',
        );
      }
      return userId;
    }
    if (activeRole === Role.COACH || activeRole === Role.ADMIN) {
      if (!athleteUserId) {
        throw new BadRequestException('athleteUserId is required');
      }
      return athleteUserId;
    }
    throw new ForbiddenException('Role cannot manage workout plans');
  }

  private async workoutPlanAccessFilter(
    userId: string,
    activeRole: Role,
    query: ListWorkoutPlansQueryDto,
  ): Promise<QueryFilter<WorkoutPlanDocument>> {
    const filter: QueryFilter<WorkoutPlanDocument> = {};
    if (query.status) filter.status = query.status;

    if (activeRole === Role.ADMIN) {
      if (query.athleteUserId) {
        filter.athleteUserId = new Types.ObjectId(query.athleteUserId);
      }
      return filter;
    }
    if (activeRole === Role.ATHLETE) {
      filter.athleteUserId = new Types.ObjectId(userId);
      return filter;
    }
    if (activeRole === Role.COACH) {
      if (!query.athleteUserId) {
        throw new BadRequestException(
          'athleteUserId is required for coach workout plan view',
        );
      }
      await this.assertCoachStudent(userId, query.athleteUserId);
      filter.coachUserId = new Types.ObjectId(userId);
      filter.athleteUserId = new Types.ObjectId(query.athleteUserId);
      return filter;
    }
    throw new ForbiddenException('Role cannot list workout plans');
  }

  private async assertWorkoutPlanAccess(
    plan: WorkoutPlanDocument,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.ADMIN) return;
    const uid = userId;
    if (plan.athleteUserId.toString() === uid) return;
    if (activeRole === Role.COACH && plan.coachUserId?.toString() === uid) {
      await this.assertCoachStudent(uid, plan.athleteUserId.toString());
      return;
    }
    throw new ForbiddenException('Not allowed to access this workout plan');
  }

  private assertOwnerOrAdmin(
    athleteUserId: Types.ObjectId,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.ADMIN) return;
    if (athleteUserId.toString() === userId) return;
    throw new ForbiddenException('Not allowed to access this private resource');
  }

  private assertAthleteOnlyWrite(activeRole: Role, action: string) {
    if (activeRole === Role.ATHLETE) return;
    throw new ForbiddenException(`Only athletes can ${action} progress data`);
  }

  private async findExercise(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Exercise not found');
    }
    const item = await this.exerciseModel.findById(id);
    if (!item) throw new NotFoundException('Exercise not found');
    return item;
  }

  private async findWorkoutPlan(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Workout plan not found');
    }
    const item = await this.workoutPlanModel.findById(id);
    if (!item) throw new NotFoundException('Workout plan not found');
    return item;
  }

  private async findMetric(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Progress metric not found');
    }
    const item = await this.metricModel.findById(id);
    if (!item) throw new NotFoundException('Progress metric not found');
    return item;
  }

  private async findPhoto(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Progress photo not found');
    }
    const item = await this.photoModel.findById(id);
    if (!item) throw new NotFoundException('Progress photo not found');
    return item;
  }

  private async findMetricType(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Metric type not found');
    }
    const item = await this.metricTypeModel.findById(id);
    if (!item) throw new NotFoundException('Metric type not found');
    return item;
  }

  private async findOwnedWorkoutProgram(id: string, coachUserId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Workout program not found');
    }
    const item = await this.workoutProgramModel.findOne({
      _id: new Types.ObjectId(id),
      'owner.type': WorkoutProgramOwnerType.COACH,
      'owner.id': new Types.ObjectId(coachUserId),
    });
    if (!item) throw new NotFoundException('Workout program not found');
    return item;
  }

  private async ensureDefaultMetricTypes() {
    try {
      await this.metricTypeModel.bulkWrite(
        DEFAULT_METRIC_TYPES.map((row) => ({
          updateOne: {
            filter: { key: row.key },
            update: {
              $setOnInsert: {
                ...row,
                status: MetricTypeStatus.ACTIVE,
                canonicalUnit: row.canonicalUnit ?? row.unit,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    } catch (err) {
      // Concurrent seed races are fine — catalog already exists.
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }

  private mapWeeks(weeks: WorkoutPlanWeekDto[]) {
    return weeks.map((week) => ({
      weekIndex: week.weekIndex,
      days: (week.days ?? []).map((day) => ({
        dayIndex: day.dayIndex,
        exercises: (day.exercises ?? []).map((ex) => ({
          exerciseId: new Types.ObjectId(ex.exerciseId),
          sets: ex.sets,
          reps: ex.reps,
          durationSec: ex.durationSec,
          note: ex.note?.trim(),
        })),
      })),
    }));
  }

  private mapPeriod(period?: { start?: string; end?: string }) {
    if (!period) return undefined;
    const start = period.start ? new Date(period.start) : undefined;
    const end = period.end ? new Date(period.end) : undefined;
    if (start && end && start > end) {
      throw new BadRequestException('period.start must be before period.end');
    }
    return { start, end };
  }

  private appendWorkoutPlanRevision(
    plan: WorkoutPlanDocument,
    createdByUserId: string,
  ) {
    const revisionId = new Types.ObjectId();
    const revision = (plan.currentRevision ?? 0) + 1;
    const snapshot: WorkoutPlanRevision = {
      _id: revisionId,
      revision,
      title: plan.title,
      weeks: (plan.weeks ?? []).map((week) => ({
        weekIndex: week.weekIndex,
        days: (week.days ?? []).map((day) => ({
          dayIndex: day.dayIndex,
          exercises: (day.exercises ?? []).map((exercise) => ({
            exerciseId: new Types.ObjectId(exercise.exerciseId),
            sets: exercise.sets,
            reps: exercise.reps,
            durationSec: exercise.durationSec,
            note: exercise.note,
          })),
        })),
      })),
      period: plan.period
        ? {
            start: plan.period.start ? new Date(plan.period.start) : undefined,
            end: plan.period.end ? new Date(plan.period.end) : undefined,
          }
        : undefined,
      createdByUserId: new Types.ObjectId(createdByUserId),
      createdAt: new Date(),
    };
    plan.revisions = [...(plan.revisions ?? []), snapshot];
    plan.currentRevisionId = revisionId;
    plan.currentRevision = revision;
    plan.markModified('revisions');
    return revisionId;
  }

  private async ensureCurrentWorkoutPlanRevision(
    plan: WorkoutPlanDocument,
    actorId: string,
  ) {
    const current = plan.currentRevisionId;
    if (
      current &&
      (plan.revisions ?? []).some(
        (revision) => revision._id.toString() === current.toString(),
      )
    ) {
      return current;
    }
    const revisionId = this.appendWorkoutPlanRevision(plan, actorId);
    await plan.save();
    return revisionId;
  }

  private toExercise(doc: {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    muscleKeys?: string[];
    equipmentKeys?: string[];
    mediaId?: Types.ObjectId;
    status: ExerciseStatus;
    origin: { kind: ExerciseOriginKind; userId?: Types.ObjectId };
    verification?: {
      status: VerificationStatus;
      reviewedBy?: Types.ObjectId;
      reviewedAt?: Date;
      rejectionReason?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description ?? null,
      muscleKeys: doc.muscleKeys ?? [],
      equipmentKeys: doc.equipmentKeys ?? [],
      mediaId: doc.mediaId?.toString() ?? null,
      status: doc.status,
      origin: {
        kind: doc.origin.kind,
        userId: doc.origin.userId?.toString() ?? null,
      },
      verification: {
        status: doc.verification?.status ?? VerificationStatus.APPROVED,
        reviewedBy: doc.verification?.reviewedBy?.toString() ?? null,
        reviewedAt: doc.verification?.reviewedAt?.toISOString() ?? null,
        rejectionReason: doc.verification?.rejectionReason ?? null,
      },
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toWorkoutPlan(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    coachUserId?: Types.ObjectId;
    programId?: Types.ObjectId;
    title: string;
    status: WorkoutPlanStatus;
    privacy: Privacy;
    weeks: {
      weekIndex: number;
      days: {
        dayIndex: number;
        exercises: {
          exerciseId: Types.ObjectId;
          sets: number;
          reps?: number;
          durationSec?: number;
          note?: string;
        }[];
      }[];
    }[];
    period?: { start?: Date; end?: Date };
    currentRevisionId?: Types.ObjectId;
    currentRevision?: number;
    revisions?: WorkoutPlanRevision[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      coachUserId: doc.coachUserId?.toString() ?? null,
      programId: doc.programId?.toString() ?? null,
      title: doc.title,
      status: doc.status,
      privacy: doc.privacy,
      weeks: (doc.weeks ?? []).map((week) => ({
        weekIndex: week.weekIndex,
        days: (week.days ?? []).map((day) => ({
          dayIndex: day.dayIndex,
          exercises: (day.exercises ?? []).map((ex) => ({
            exerciseId: ex.exerciseId.toString(),
            sets: ex.sets,
            reps: ex.reps ?? null,
            durationSec: ex.durationSec ?? null,
            note: ex.note ?? null,
          })),
        })),
      })),
      period: doc.period
        ? {
            start: doc.period.start?.toISOString() ?? null,
            end: doc.period.end?.toISOString() ?? null,
          }
        : null,
      currentRevisionId: doc.currentRevisionId?.toString() ?? null,
      currentRevision: doc.currentRevision ?? null,
      revisions: (doc.revisions ?? []).map((revision) => ({
        id: revision._id.toString(),
        revision: revision.revision,
        createdByUserId: revision.createdByUserId.toString(),
        createdAt: revision.createdAt.toISOString(),
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toWorkoutPlanRevision(revision: WorkoutPlanRevision) {
    return {
      id: revision._id.toString(),
      revision: revision.revision,
      title: revision.title,
      weeks: (revision.weeks ?? []).map((week) => ({
        weekIndex: week.weekIndex,
        days: (week.days ?? []).map((day) => ({
          dayIndex: day.dayIndex,
          exercises: (day.exercises ?? []).map((exercise) => ({
            exerciseId: exercise.exerciseId.toString(),
            sets: exercise.sets,
            reps: exercise.reps ?? null,
            durationSec: exercise.durationSec ?? null,
            note: exercise.note ?? null,
          })),
        })),
      })),
      period: revision.period
        ? {
            start: revision.period.start?.toISOString() ?? null,
            end: revision.period.end?.toISOString() ?? null,
          }
        : null,
      createdByUserId: revision.createdByUserId.toString(),
      createdAt: revision.createdAt.toISOString(),
    };
  }

  private toMetricType(doc: {
    _id: Types.ObjectId;
    key: string;
    name: string;
    valueKind: MetricValueKind;
    unit?: string;
    canonicalUnit?: string;
    validation?: {
      min?: number;
      max?: number;
      step?: number;
      integer?: boolean;
    };
    aggregation?: MetricAggregation;
    periodKind?: MetricPeriodKind;
    privacyClass?: MetricPrivacyClass;
    sourceMappings?: Record<string, string>;
    sportId?: string;
    status: MetricTypeStatus;
    sortHint: number;
    chartKind?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const unit = doc.canonicalUnit ?? doc.unit ?? null;
    return {
      id: doc._id.toString(),
      key: doc.key,
      name: doc.name,
      valueKind: doc.valueKind,
      unit,
      canonicalUnit: unit,
      validation: doc.validation
        ? {
            min: doc.validation.min ?? null,
            max: doc.validation.max ?? null,
            step: doc.validation.step ?? null,
            integer: doc.validation.integer ?? false,
          }
        : null,
      aggregation: doc.aggregation ?? MetricAggregation.LATEST,
      periodKind: doc.periodKind ?? MetricPeriodKind.POINT,
      privacyClass: doc.privacyClass ?? MetricPrivacyClass.WELLNESS,
      sourceMappings: doc.sourceMappings ?? null,
      sportId: doc.sportId ?? null,
      status: doc.status,
      sortHint: doc.sortHint,
      chartKind: doc.chartKind ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toWorkoutProgram(doc: {
    _id: Types.ObjectId;
    owner: { type: WorkoutProgramOwnerType; id?: Types.ObjectId };
    title: string;
    status: WorkoutProgramStatus;
    privacy: Privacy;
    meta?: {
      focusLabel?: string;
      weekCount?: number;
      sessionsPerWeek?: number;
    };
    weeks: {
      weekIndex: number;
      days: {
        dayIndex: number;
        exercises: {
          exerciseId: Types.ObjectId;
          sets: number;
          reps?: number;
          durationSec?: number;
          note?: string;
        }[];
      }[];
    }[];
    assignedCount: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      owner: {
        type: doc.owner.type,
        id: doc.owner.id?.toString() ?? null,
      },
      title: doc.title,
      status: doc.status,
      privacy: doc.privacy,
      meta: {
        focusLabel: doc.meta?.focusLabel ?? null,
        weekCount: doc.meta?.weekCount ?? null,
        sessionsPerWeek: doc.meta?.sessionsPerWeek ?? null,
      },
      weeks: (doc.weeks ?? []).map((week) => ({
        weekIndex: week.weekIndex,
        days: (week.days ?? []).map((day) => ({
          dayIndex: day.dayIndex,
          exercises: (day.exercises ?? []).map((ex) => ({
            exerciseId: ex.exerciseId.toString(),
            sets: ex.sets,
            reps: ex.reps ?? null,
            durationSec: ex.durationSec ?? null,
            note: ex.note ?? null,
          })),
        })),
      })),
      assignedCount: doc.assignedCount ?? 0,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toMetric(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    privacy: Privacy;
    metricKey: string;
    value: number;
    unit?: string;
    recordedAt: Date;
    note?: string;
    source?: MetricSource;
    sourceRecordId?: string;
    clientMutationId?: string;
    period?: { start?: Date; end?: Date };
    periodStartAt?: Date;
    periodEndAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return projectProgressMetric(doc);
  }

  private async assertMetricValue(metricKey: string, value: number) {
    if (!Number.isFinite(value)) {
      throw new BadRequestException('Metric value must be finite');
    }
    await this.ensureDefaultMetricTypes();
    const type = await this.metricTypeModel
      .findOne({ key: metricKey.trim() })
      .lean();
    const range =
      type?.validation ??
      (
        {
          weight_kg: { min: 1, max: 500 },
          height_cm: { min: 50, max: 250 },
          water_ml: { min: 0, max: 20_000 },
          steps: { min: 0, max: 200_000, integer: true },
          walking_distance_km: { min: 0, max: 500 },
          walking_duration_min: { min: 0, max: 1_440 },
          sleep_duration_min: { min: 0, max: 1_440 },
          sleep_quality: { min: 1, max: 5, integer: true },
          calories_kcal: { min: 0, max: 20_000 },
          mood: { min: 1, max: 5, integer: true },
        } as Record<string, { min?: number; max?: number; integer?: boolean }>
      )[metricKey.trim()];
    if (!range) return;
    if (range.min !== undefined && value < range.min) {
      throw new BadRequestException(`Metric value must be >= ${range.min}`);
    }
    if (range.max !== undefined && value > range.max) {
      throw new BadRequestException(`Metric value must be <= ${range.max}`);
    }
    if (range.integer && !Number.isInteger(value)) {
      throw new BadRequestException('Metric value must be an integer');
    }
  }

  private resolveMetricPeriod(dto: {
    period?: { start?: string; end?: string };
    periodStartAt?: string;
    periodEndAt?: string;
  }): { start?: Date; end?: Date } | undefined {
    const startRaw = dto.period?.start ?? dto.periodStartAt;
    const endRaw = dto.period?.end ?? dto.periodEndAt;
    if (!startRaw && !endRaw) return undefined;
    const start = startRaw ? new Date(startRaw) : undefined;
    const end = endRaw ? new Date(endRaw) : undefined;
    if (start && end && start > end) {
      throw new BadRequestException('period.start must be before period.end');
    }
    return { start, end };
  }

  private syncDedupeFilter(
    athleteUserId: Types.ObjectId,
    entry: SyncProgressMetricItemDto,
  ): QueryFilter<ProgressMetricDocument> {
    if (entry.sourceRecordId?.trim()) {
      return {
        athleteUserId,
        source: entry.source,
        sourceRecordId: entry.sourceRecordId.trim(),
      };
    }
    return {
      athleteUserId,
      clientMutationId: entry.clientMutationId!.trim(),
    };
  }

  private aggregateValues(
    aggregation: MetricAggregation,
    values: number[],
  ): number | null {
    if (values.length === 0) return null;
    switch (aggregation) {
      case MetricAggregation.SUM:
        return values.reduce((a, b) => a + b, 0);
      case MetricAggregation.AVERAGE:
        return values.reduce((a, b) => a + b, 0) / values.length;
      case MetricAggregation.MIN:
        return Math.min(...values);
      case MetricAggregation.MAX:
        return Math.max(...values);
      case MetricAggregation.LATEST:
      default:
        return values[0] ?? null;
    }
  }

  private toPhoto(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    mediaId: Types.ObjectId;
    privacy: Privacy;
    capturedAt: Date;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      mediaId: doc.mediaId.toString(),
      privacy: doc.privacy,
      capturedAt: doc.capturedAt.toISOString(),
      note: doc.note ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  // ── Workout logs ────────────────────────────────────────────────────────

  async createWorkoutLog(
    dto: CreateWorkoutLogDto,
    athleteId: string,
    request: Request,
  ) {
    const plan = await this.workoutPlanModel.findById(dto.planId);
    if (!plan) throw new NotFoundException('Workout plan not found');
    if (plan.athleteUserId.toString() !== athleteId) {
      throw new ForbiddenException('Not your workout plan');
    }

    if (dto.clientMutationId) {
      const existing = await this.workoutLogModel
        .findOne({
          athleteId: new Types.ObjectId(athleteId),
          clientMutationId: dto.clientMutationId.trim(),
        })
        .lean();
      if (existing) return this.toWorkoutLog(existing);
    }

    const status = dto.status ?? WorkoutLogStatus.DRAFT;
    if (
      status !== WorkoutLogStatus.DRAFT &&
      status !== WorkoutLogStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Workout logs must start as draft or in progress',
      );
    }
    const revisionId = await this.ensureCurrentWorkoutPlanRevision(
      plan,
      athleteId,
    );
    if (dto.planRevisionId && dto.planRevisionId !== revisionId.toString()) {
      throw new BadRequestException(
        'Workout log revision must match the current plan revision',
      );
    }
    const item = await this.workoutLogModel.create({
      planId: new Types.ObjectId(dto.planId),
      planRevisionId: revisionId,
      athleteId: new Types.ObjectId(athleteId),
      sessionIndex: dto.sessionIndex,
      sets: (dto.sets ?? []).map((s) => ({
        exerciseId: new Types.ObjectId(s.exerciseId),
        reps: s.reps,
        weightKg: s.weightKg,
        durationSec: s.durationSec,
        distanceM: s.distanceM,
        rpe: s.rpe,
      })),
      status,
      timing: dto.timing
        ? {
            startedAt: dto.timing.startedAt
              ? new Date(dto.timing.startedAt)
              : undefined,
            completedAt: dto.timing.completedAt
              ? new Date(dto.timing.completedAt)
              : undefined,
            durationSec: dto.timing.durationSec,
          }
        : undefined,
      note: dto.note?.trim(),
      pain: dto.pain
        ? {
            score: dto.pain.score,
            bodyAreaKeys: dto.pain.bodyAreaKeys ?? [],
          }
        : undefined,
      clientMutationId: dto.clientMutationId?.trim(),
      loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
    });

    this.audit.log({
      action: AuditAction.WORKOUT_LOG_UPSERTED,
      actorId: athleteId,
      metadata: { workoutLogId: item._id.toString(), planId: dto.planId },
      request,
    });
    if (
      status === WorkoutLogStatus.IN_PROGRESS ||
      status === WorkoutLogStatus.DRAFT
    ) {
      void this.events.track({
        eventName: AnalyticsEventName.WORKOUT_STARTED,
        actor: { userId: athleteId, activeRole: Role.ATHLETE },
        properties: {
          workoutLogId: item._id.toString(),
          planId: dto.planId,
          status,
        },
      });
    }
    return this.toWorkoutLog(item.toObject());
  }

  async updateWorkoutLog(
    id: string,
    dto: UpdateWorkoutLogDto,
    athleteId: string,
    request: Request,
  ) {
    const item = await this.findWorkoutLog(id);
    if (item.athleteId.toString() !== athleteId) {
      throw new ForbiddenException('Not your workout log');
    }
    if (
      item.status === WorkoutLogStatus.COMPLETED ||
      item.status === WorkoutLogStatus.SKIPPED ||
      item.status === WorkoutLogStatus.ABANDONED
    ) {
      throw new BadRequestException('Terminal workout logs cannot be patched');
    }
    if (
      dto.status === WorkoutLogStatus.COMPLETED ||
      dto.status === WorkoutLogStatus.SKIPPED
    ) {
      throw new BadRequestException(
        'Use the dedicated completion or skip flow for terminal states',
      );
    }
    if (dto.sets !== undefined) {
      item.sets = dto.sets.map((s) => ({
        exerciseId: new Types.ObjectId(s.exerciseId),
        reps: s.reps,
        weightKg: s.weightKg,
        durationSec: s.durationSec,
        distanceM: s.distanceM,
        rpe: s.rpe,
      }));
    }
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.timing !== undefined) {
      item.timing = {
        startedAt: dto.timing.startedAt
          ? new Date(dto.timing.startedAt)
          : item.timing?.startedAt,
        completedAt: dto.timing.completedAt
          ? new Date(dto.timing.completedAt)
          : item.timing?.completedAt,
        durationSec: dto.timing.durationSec ?? item.timing?.durationSec,
      };
      item.markModified('timing');
    }
    if (dto.note !== undefined) item.note = dto.note?.trim() || undefined;
    if (dto.pain !== undefined) {
      item.pain = dto.pain
        ? {
            score: dto.pain.score,
            bodyAreaKeys: dto.pain.bodyAreaKeys ?? [],
          }
        : undefined;
      item.markModified('pain');
    }
    if (dto.loggedAt !== undefined) item.loggedAt = new Date(dto.loggedAt);
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_LOG_UPSERTED,
      actorId: athleteId,
      metadata: { workoutLogId: id, op: 'patch' },
      request,
    });
    if (dto.status === WorkoutLogStatus.ABANDONED) {
      void this.events.track({
        eventName: AnalyticsEventName.WORKOUT_ABANDONED,
        actor: { userId: athleteId, activeRole: Role.ATHLETE },
        properties: {
          workoutLogId: id,
          planId: item.planId.toString(),
        },
      });
    } else if (dto.status === WorkoutLogStatus.IN_PROGRESS) {
      void this.events.track({
        eventName: AnalyticsEventName.WORKOUT_STARTED,
        actor: { userId: athleteId, activeRole: Role.ATHLETE },
        properties: {
          workoutLogId: id,
          planId: item.planId.toString(),
          status: dto.status,
        },
      });
    }
    return this.toWorkoutLog(item.toObject());
  }

  async completeWorkoutLog(id: string, athleteId: string, request: Request) {
    const item = await this.findWorkoutLog(id);
    if (item.athleteId.toString() !== athleteId) {
      throw new ForbiddenException('Not your workout log');
    }
    if (item.status === WorkoutLogStatus.COMPLETED) {
      return this.toWorkoutLog(item.toObject());
    }
    if (
      item.status === WorkoutLogStatus.SKIPPED ||
      item.status === WorkoutLogStatus.ABANDONED
    ) {
      throw new BadRequestException(
        `Cannot complete workout log in status ${item.status}`,
      );
    }
    const completedAt = new Date();
    item.status = WorkoutLogStatus.COMPLETED;
    item.timing = {
      startedAt: item.timing?.startedAt ?? item.loggedAt,
      completedAt,
      durationSec:
        item.timing?.durationSec ??
        (item.timing?.startedAt
          ? Math.max(
              0,
              Math.round(
                (completedAt.getTime() -
                  (item.timing.startedAt ?? item.loggedAt).getTime()) /
                  1000,
              ),
            )
          : undefined),
    };
    item.markModified('timing');
    item.loggedAt = completedAt;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_LOG_UPSERTED,
      actorId: athleteId,
      metadata: { workoutLogId: id, op: 'complete' },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.WORKOUT_COMPLETED,
      actor: { userId: athleteId, activeRole: Role.ATHLETE },
      properties: {
        workoutLogId: id,
        planId: item.planId.toString(),
        durationSec: item.timing?.durationSec ?? null,
      },
    });
    return this.toWorkoutLog(item.toObject());
  }

  async skipWorkoutLog(id: string, athleteId: string, request: Request) {
    const item = await this.findWorkoutLog(id);
    if (item.athleteId.toString() !== athleteId) {
      throw new ForbiddenException('Not your workout log');
    }
    if (item.status === WorkoutLogStatus.SKIPPED) {
      return this.toWorkoutLog(item.toObject());
    }
    if (
      item.status === WorkoutLogStatus.COMPLETED ||
      item.status === WorkoutLogStatus.ABANDONED
    ) {
      throw new BadRequestException(
        `Cannot skip workout log in status ${item.status}`,
      );
    }
    const completedAt = new Date();
    item.status = WorkoutLogStatus.SKIPPED;
    item.timing = {
      startedAt: item.timing?.startedAt,
      completedAt,
      durationSec: item.timing?.durationSec,
    };
    item.markModified('timing');
    item.loggedAt = completedAt;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_LOG_UPSERTED,
      actorId: athleteId,
      metadata: { workoutLogId: id, op: 'skip' },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.WORKOUT_SKIPPED,
      actor: { userId: athleteId, activeRole: Role.ATHLETE },
      properties: {
        workoutLogId: id,
        planId: item.planId.toString(),
      },
    });
    return this.toWorkoutLog(item.toObject());
  }

  async listWorkoutLogs(
    userId: string,
    activeRole: Role,
    query: ListWorkoutLogsQueryDto,
  ) {
    const filter: QueryFilter<WorkoutLogDocument> = {};
    if (query.planId) filter.planId = new Types.ObjectId(query.planId);
    if (query.status) filter.status = query.status;

    if (activeRole === Role.ATHLETE) {
      filter.athleteId = new Types.ObjectId(userId);
    } else if (activeRole === Role.COACH) {
      const athleteId = query.athleteId;
      if (!athleteId) {
        throw new BadRequestException('athleteId required for coach view');
      }
      await this.assertCoachStudent(userId, athleteId);
      await this.assertActiveGrantScope(
        athleteId,
        userId,
        AthleteDataGrantScope.WORKOUTS_LOGS,
      );
      filter.athleteId = new Types.ObjectId(athleteId);
    } else if (activeRole === Role.ADMIN) {
      if (query.athleteId) {
        filter.athleteId = new Types.ObjectId(query.athleteId);
      }
    } else {
      throw new ForbiddenException('Not allowed');
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.workoutLogModel
        .find(filter)
        .sort({ loggedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.workoutLogModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toWorkoutLog(item)),
      total,
      page,
      pageSize,
    );
  }

  async reviewWorkoutLog(
    id: string,
    dto: ReviewWorkoutLogDto,
    coachUserId: string,
    request: Request,
  ) {
    const item = await this.findWorkoutLog(id);
    if (item.status !== WorkoutLogStatus.COMPLETED) {
      throw new BadRequestException(
        'Only completed workout logs can be reviewed',
      );
    }
    const athleteId = item.athleteId.toString();
    await this.assertCoachStudent(coachUserId, athleteId);
    await this.assertActiveGrantScope(
      athleteId,
      coachUserId,
      AthleteDataGrantScope.WORKOUTS_LOGS,
    );
    const plan = await this.workoutPlanModel.findById(item.planId).lean();
    if (!plan || plan.coachUserId?.toString() !== coachUserId) {
      throw new ForbiddenException(
        'Only the assigned coach can review this workout log',
      );
    }

    const clientMutationId = dto.clientMutationId.trim();
    const prior = item.reviews?.find(
      (review) =>
        review.coachUserId.toString() === coachUserId &&
        review.clientMutationId === clientMutationId,
    );
    if (prior) return this.toWorkoutLog(item.toObject());

    const review = {
      _id: new Types.ObjectId(),
      coachUserId: new Types.ObjectId(coachUserId),
      note: dto.note.trim(),
      clientMutationId,
      reviewedAt: new Date(),
    };
    const result = await this.transactions.run(async (session) => {
      const mutation = await this.workoutLogModel.updateOne(
        {
          _id: item._id,
          reviews: {
            $not: {
              $elemMatch: {
                coachUserId: new Types.ObjectId(coachUserId),
                clientMutationId,
              },
            },
          },
        },
        { $push: { reviews: review } },
        { session },
      );
      await this.outbox.enqueue(
        {
          eventName: 'workout.log_reviewed',
          idempotencyKey: `workout-review:${id}:${coachUserId}:${clientMutationId}`,
          payload: {
            workoutLogId: id,
            athleteId,
            coachUserId,
            reviewId: review._id.toString(),
            notification: {
              userId: athleteId,
              templateKey: NotificationTemplateKey.WORKOUT_REVIEWED,
              params: {},
              payload: {
                kind: 'workout_review',
                workoutLogId: id,
                planId: item.planId.toString(),
              },
            },
          },
        },
        session,
      );
      return mutation;
    });
    const updated = await this.findWorkoutLog(id);
    if (result.modifiedCount > 0) {
      this.audit.log({
        action: AuditAction.WORKOUT_LOG_REVIEWED,
        actorId: coachUserId,
        metadata: {
          workoutLogId: id,
          athleteId,
          reviewId: review._id.toString(),
        },
        request,
      });
    }
    return this.toWorkoutLog(updated.toObject());
  }

  // ── Personal records ────────────────────────────────────────────────────

  async createPersonalRecord(
    dto: CreatePersonalRecordDto,
    athleteId: string,
    request: Request,
  ) {
    const item = await this.personalRecordModel.create({
      athleteId: new Types.ObjectId(athleteId),
      metricTypeKey: dto.metricTypeKey.trim(),
      value: dto.value,
      achievedAt: dto.achievedAt ? new Date(dto.achievedAt) : new Date(),
      privacy: dto.privacy ?? Privacy.PRIVATE,
      note: dto.note?.trim(),
    });
    this.audit.log({
      action: AuditAction.PERSONAL_RECORD_UPSERTED,
      actorId: athleteId,
      metadata: { personalRecordId: item._id.toString() },
      request,
    });
    return this.toPersonalRecord(item.toObject());
  }

  async listPersonalRecords(
    userId: string,
    activeRole: Role,
    query: ListPersonalRecordsQueryDto,
  ) {
    const filter: QueryFilter<PersonalRecordDocument> = {};
    if (query.metricTypeKey) filter.metricTypeKey = query.metricTypeKey;

    if (activeRole === Role.ATHLETE) {
      filter.athleteId = new Types.ObjectId(userId);
    } else if (activeRole === Role.COACH) {
      const athleteId = query.athleteId;
      if (!athleteId) {
        throw new BadRequestException('athleteId required for coach view');
      }
      await this.assertCoachStudent(userId, athleteId);
      await this.assertActiveGrantScope(
        athleteId,
        userId,
        AthleteDataGrantScope.PROGRESS_PERSONAL_RECORDS,
      );
      filter.athleteId = new Types.ObjectId(athleteId);
      filter.privacy = {
        $in: [Privacy.PUBLIC, Privacy.FOLLOWERS, Privacy.COACH_ONLY],
      };
    } else if (activeRole === Role.ADMIN) {
      if (query.athleteId) {
        filter.athleteId = new Types.ObjectId(query.athleteId);
      }
    } else {
      throw new ForbiddenException('Not allowed');
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.personalRecordModel
        .find(filter)
        .sort({ achievedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.personalRecordModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toPersonalRecord(item)),
      total,
      page,
      pageSize,
    );
  }

  private async assertCoachStudent(coachId: string, athleteId: string) {
    const link = await this.coachStudentModel.findOne({
      coachUserId: new Types.ObjectId(coachId),
      athleteUserId: new Types.ObjectId(athleteId),
      status: CoachStudentStatus.ACTIVE,
    });
    if (!link) {
      throw new ForbiddenException('Not an active coach–student relationship');
    }
    return link;
  }

  private async findWorkoutLog(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Workout log not found');
    }
    const item = await this.workoutLogModel.findById(id);
    if (!item) throw new NotFoundException('Workout log not found');
    return item;
  }

  private async resolveProgressAthleteId(
    userId: string,
    activeRole: Role,
    athleteUserId: string | undefined,
    resource: 'metrics' | 'photos',
  ): Promise<string> {
    if (activeRole === Role.ATHLETE) {
      if (athleteUserId && athleteUserId !== userId) {
        throw new ForbiddenException(
          `Athletes can only access their own ${resource}`,
        );
      }
      return userId;
    }
    if (activeRole === Role.ADMIN) {
      return athleteUserId ?? userId;
    }
    if (activeRole === Role.COACH) {
      if (!athleteUserId) {
        throw new BadRequestException(
          'athleteUserId is required for coach view',
        );
      }
      await this.assertCoachStudent(userId, athleteUserId);
      return athleteUserId;
    }
    throw new ForbiddenException(`Role cannot access ${resource}`);
  }

  private async loadActiveGrant(athleteUserId: string, coachUserId: string) {
    const now = new Date();
    await this.dataGrantModel.updateMany(
      {
        athleteUserId: new Types.ObjectId(athleteUserId),
        'grantee.type': AthleteDataGranteeType.COACH,
        'grantee.userId': new Types.ObjectId(coachUserId),
        status: AthleteDataGrantStatus.ACTIVE,
        'effective.expiresAt': { $lte: now },
      },
      { $set: { status: AthleteDataGrantStatus.EXPIRED } },
    );
    return this.dataGrantModel.findOne({
      athleteUserId: new Types.ObjectId(athleteUserId),
      'grantee.type': AthleteDataGranteeType.COACH,
      'grantee.userId': new Types.ObjectId(coachUserId),
      status: AthleteDataGrantStatus.ACTIVE,
      $or: [
        { 'effective.expiresAt': { $exists: false } },
        { 'effective.expiresAt': null },
        { 'effective.expiresAt': { $gt: now } },
      ],
    });
  }

  private async assertActiveGrantScope(
    athleteUserId: string,
    coachUserId: string,
    scope: AthleteDataGrantScope,
  ) {
    const grant = await this.loadActiveGrant(athleteUserId, coachUserId);
    if (!grant || !grantAllowsScope(grant.scopes, scope)) {
      throw new ForbiddenException(
        `Active data grant with scope ${scope} is required`,
      );
    }
  }

  private async coachAllowedMetricKeys(
    coachUserId: string,
    athleteUserId: string,
  ): Promise<string[]> {
    const grant = await this.loadActiveGrant(athleteUserId, coachUserId);
    if (!grant) {
      throw new ForbiddenException('Active data grant is required');
    }
    if (grantAllowsScope(grant.scopes, AthleteDataGrantScope.METRICS_ALL)) {
      const types = await this.metricTypeModel
        .find({ status: MetricTypeStatus.ACTIVE })
        .select({ key: 1 })
        .lean();
      return metricKeysAllowedByGrant(
        grant.scopes,
        types.map((type) => type.key),
      );
    }
    return metricKeysAllowedByGrant(grant.scopes);
  }

  private async assertCoachMetricScopeIfNeeded(
    userId: string,
    activeRole: Role,
    athleteUserId: string,
    metricKeys: string[],
  ) {
    if (activeRole !== Role.COACH) return;
    const allowed = await this.coachAllowedMetricKeys(userId, athleteUserId);
    for (const key of metricKeys) {
      if (!allowed.includes(key)) {
        throw new ForbiddenException(`No active grant for metric ${key}`);
      }
    }
  }

  private toWorkoutLog(doc: {
    _id: Types.ObjectId;
    planId: Types.ObjectId;
    planRevisionId?: Types.ObjectId;
    athleteId: Types.ObjectId;
    sessionIndex: number;
    sets: {
      exerciseId: Types.ObjectId;
      reps: number;
      weightKg?: number;
      durationSec?: number;
      distanceM?: number;
      rpe?: number;
    }[];
    status: WorkoutLogStatus;
    timing?: {
      startedAt?: Date;
      completedAt?: Date;
      durationSec?: number;
    };
    note?: string;
    pain?: { score?: number; bodyAreaKeys?: string[] };
    reviews?: {
      _id: Types.ObjectId;
      coachUserId: Types.ObjectId;
      note: string;
      clientMutationId: string;
      reviewedAt: Date;
    }[];
    clientMutationId?: string;
    loggedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      planId: doc.planId.toString(),
      planRevisionId: doc.planRevisionId?.toString() ?? null,
      athleteId: doc.athleteId.toString(),
      sessionIndex: doc.sessionIndex,
      sets: (doc.sets ?? []).map((s) => ({
        exerciseId: s.exerciseId.toString(),
        reps: s.reps,
        weightKg: s.weightKg ?? null,
        durationSec: s.durationSec ?? null,
        distanceM: s.distanceM ?? null,
        rpe: s.rpe ?? null,
      })),
      status: doc.status,
      timing: doc.timing
        ? {
            startedAt: doc.timing.startedAt?.toISOString() ?? null,
            completedAt: doc.timing.completedAt?.toISOString() ?? null,
            durationSec: doc.timing.durationSec ?? null,
          }
        : null,
      note: doc.note ?? null,
      pain: doc.pain
        ? {
            score: doc.pain.score ?? null,
            bodyAreaKeys: doc.pain.bodyAreaKeys ?? [],
          }
        : null,
      reviews: (doc.reviews ?? []).map((review) => ({
        id: review._id.toString(),
        coachUserId: review.coachUserId.toString(),
        note: review.note,
        clientMutationId: review.clientMutationId,
        reviewedAt: review.reviewedAt.toISOString(),
      })),
      clientMutationId: doc.clientMutationId ?? null,
      loggedAt: doc.loggedAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toPersonalRecord(doc: {
    _id: Types.ObjectId;
    athleteId: Types.ObjectId;
    metricTypeKey: string;
    value: number;
    achievedAt: Date;
    privacy: Privacy;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteId: doc.athleteId.toString(),
      metricTypeKey: doc.metricTypeKey,
      value: doc.value,
      achievedAt: doc.achievedAt.toISOString(),
      privacy: doc.privacy,
      note: doc.note ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  // ── Goals ───────────────────────────────────────────────────────────────

  async listMetricGoals(userId: string, query: ListMetricGoalsQueryDto) {
    const filter: QueryFilter<MetricGoalDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (query.metricKey) filter.metricKey = query.metricKey;
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricGoalModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricGoalModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMetricGoal(item)),
      total,
      page,
      pageSize,
    );
  }

  async createMetricGoal(
    dto: CreateMetricGoalDto,
    userId: string,
    request: Request,
  ) {
    const item = await this.metricGoalModel.create({
      athleteUserId: new Types.ObjectId(userId),
      metricKey: dto.metricKey.trim(),
      target: {
        operator: dto.target.operator,
        value: dto.target.value,
        unit: dto.target.unit?.trim(),
      },
      period: dto.period,
      effective: {
        start: new Date(dto.effective.start),
        end: dto.effective.end ? new Date(dto.effective.end) : undefined,
      },
      status: dto.status ?? MetricGoalStatus.ACTIVE,
    });
    this.audit.log({
      action: AuditAction.PROGRESS_GOAL_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric_goal', goalId: item._id.toString() },
      request,
    });
    return this.toMetricGoal(item.toObject());
  }

  async updateMetricGoal(
    id: string,
    dto: UpdateMetricGoalDto,
    userId: string,
    request: Request,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Metric goal not found');
    }
    const item = await this.metricGoalModel.findOne({
      _id: new Types.ObjectId(id),
      athleteUserId: new Types.ObjectId(userId),
    });
    if (!item) throw new NotFoundException('Metric goal not found');
    if (dto.target !== undefined) {
      item.target = {
        operator: dto.target.operator,
        value: dto.target.value,
        unit: dto.target.unit?.trim(),
      };
      item.markModified('target');
    }
    if (dto.period !== undefined) item.period = dto.period;
    if (dto.effective !== undefined) {
      item.effective = {
        start: new Date(dto.effective.start),
        end: dto.effective.end ? new Date(dto.effective.end) : undefined,
      };
      item.markModified('effective');
    }
    if (dto.status !== undefined) item.status = dto.status;
    await item.save();
    this.audit.log({
      action: AuditAction.PROGRESS_GOAL_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric_goal', goalId: id, op: 'update' },
      request,
    });
    return this.toMetricGoal(item.toObject());
  }

  // ── Reminders ───────────────────────────────────────────────────────────

  async listMetricReminders(
    userId: string,
    query: ListMetricRemindersQueryDto,
  ) {
    const filter: QueryFilter<MetricReminderDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricReminderModel
        .find(filter)
        .sort({ metricKey: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricReminderModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMetricReminder(item)),
      total,
      page,
      pageSize,
    );
  }

  async upsertMetricReminder(
    metricKey: string,
    dto: UpsertMetricReminderDto,
    userId: string,
    request: Request,
  ) {
    const key = metricKey.trim();
    if (!key) throw new BadRequestException('metricKey is required');
    const item = await this.metricReminderModel.findOneAndUpdate(
      {
        athleteUserId: new Types.ObjectId(userId),
        metricKey: key,
      },
      {
        $set: {
          schedule: {
            timezone: dto.schedule.timezone.trim(),
            weekdays: dto.schedule.weekdays ?? [],
            localTime: dto.schedule.localTime,
          },
          quietHours:
            dto.quietHours === null
              ? undefined
              : dto.quietHours
                ? {
                    start: dto.quietHours.start,
                    end: dto.quietHours.end,
                  }
                : undefined,
          channel: dto.channel ?? MetricReminderChannel.PUSH,
          status: dto.status ?? MetricReminderStatus.PAUSED,
        },
        $setOnInsert: {
          athleteUserId: new Types.ObjectId(userId),
          metricKey: key,
        },
      },
      { upsert: true, new: true },
    );
    this.audit.log({
      action: AuditAction.PROGRESS_REMINDER_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric_reminder', metricKey: key },
      request,
    });
    return this.toMetricReminder(item.toObject());
  }

  // ── Data grants ─────────────────────────────────────────────────────────

  async listDataGrants(userId: string, query: ListAthleteDataGrantsQueryDto) {
    const filter: QueryFilter<AthleteDataGrantDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (query.status) filter.status = query.status;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.dataGrantModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.dataGrantModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toDataGrant(item)),
      total,
      page,
      pageSize,
    );
  }

  async createDataGrant(
    dto: CreateAthleteDataGrantDto,
    userId: string,
    request: Request,
  ) {
    const relationship = await this.coachStudentModel.findOne({
      _id: new Types.ObjectId(dto.relationshipId),
      athleteUserId: new Types.ObjectId(userId),
      coachUserId: new Types.ObjectId(dto.granteeUserId),
      status: CoachStudentStatus.ACTIVE,
    });
    if (!relationship) {
      throw new BadRequestException(
        'relationshipId must be an active CoachStudent for this athlete and coach',
      );
    }
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('expiresAt must be in the future');
    }
    const item = await this.dataGrantModel.create({
      athleteUserId: new Types.ObjectId(userId),
      grantee: {
        type: AthleteDataGranteeType.COACH,
        userId: new Types.ObjectId(dto.granteeUserId),
      },
      relationshipId: relationship._id,
      scopes: dto.scopes,
      effective: {
        grantedAt: new Date(),
        expiresAt,
      },
      status: AthleteDataGrantStatus.ACTIVE,
    });
    await this.dataGrantModel.updateMany(
      {
        _id: { $ne: item._id },
        athleteUserId: new Types.ObjectId(userId),
        'grantee.type': AthleteDataGranteeType.COACH,
        'grantee.userId': new Types.ObjectId(dto.granteeUserId),
        status: AthleteDataGrantStatus.ACTIVE,
      },
      {
        $set: {
          status: AthleteDataGrantStatus.REVOKED,
          revokedAt: new Date(),
          revokedBy: new Types.ObjectId(userId),
        },
      },
    );
    this.audit.log({
      action: AuditAction.PROGRESS_DATA_GRANT_CHANGED,
      actorId: userId,
      targetUserId: dto.granteeUserId,
      metadata: { kind: 'data_grant', grantId: item._id.toString() },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.DATA_GRANT_CREATED,
      actor: { userId, activeRole: Role.ATHLETE },
      properties: {
        grantId: item._id.toString(),
        scopeCount: dto.scopes.length,
        hasExpiry: Boolean(dto.expiresAt),
      },
    });
    return this.toDataGrant(item.toObject());
  }

  async revokeDataGrant(id: string, userId: string, request: Request) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Data grant not found');
    }
    const item = await this.dataGrantModel.findOne({
      _id: new Types.ObjectId(id),
      athleteUserId: new Types.ObjectId(userId),
    });
    if (!item) throw new NotFoundException('Data grant not found');
    item.status = AthleteDataGrantStatus.REVOKED;
    item.revokedAt = new Date();
    item.revokedBy = new Types.ObjectId(userId);
    await item.save();
    this.audit.log({
      action: AuditAction.PROGRESS_DATA_GRANT_CHANGED,
      actorId: userId,
      metadata: { kind: 'data_grant_revoke', grantId: id },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.DATA_GRANT_REVOKED,
      actor: { userId, activeRole: Role.ATHLETE },
      properties: { grantId: id },
    });
    return this.toDataGrant(item.toObject());
  }

  // ── Health sync state ───────────────────────────────────────────────────

  async listHealthSyncStates(
    userId: string,
    query: ListHealthSyncStatesQueryDto,
  ) {
    const filter: QueryFilter<HealthSyncStateDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (query.provider) filter.provider = query.provider;
    const items = await this.healthSyncStateModel.find(filter).lean();
    return { items: items.map((item) => this.toHealthSyncState(item)) };
  }

  async upsertHealthSyncState(
    provider: HealthSyncProvider,
    dto: UpsertHealthSyncStateDto,
    userId: string,
    request: Request,
  ) {
    if (!Object.values(HealthSyncProvider).includes(provider)) {
      throw new BadRequestException('Invalid health sync provider');
    }
    const update = buildHealthSyncStateUpdate({ provider, dto, userId });
    const item = await this.healthSyncStateModel.findOneAndUpdate(
      {
        athleteUserId: new Types.ObjectId(userId),
        provider,
      },
      update,
      { upsert: true, new: true },
    );
    this.audit.log({
      action: AuditAction.PROGRESS_HEALTH_SYNC_UPDATED,
      actorId: userId,
      metadata: { kind: 'health_sync_state', provider, status: dto.status },
      request,
    });

    if (
      dto.status === HealthSyncStatus.CONNECTED ||
      dto.status === HealthSyncStatus.SYNCING
    ) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_STARTED,
        actor: { userId, activeRole: Role.ATHLETE },
        properties: {
          provider,
          authorizedMetricKeyCount: (dto.authorizedMetricKeys ?? []).length,
        },
      });
    } else if (dto.status === HealthSyncStatus.PARTIAL) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_PARTIAL,
        actor: { userId, activeRole: Role.ATHLETE },
        properties: {
          provider,
          lastErrorCode: dto.lastErrorCode ?? null,
        },
      });
    } else if (dto.status === HealthSyncStatus.ERROR) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_FAILED,
        actor: { userId, activeRole: Role.ATHLETE },
        properties: {
          provider,
          lastErrorCode: dto.lastErrorCode ?? null,
        },
      });
    } else if (dto.status === HealthSyncStatus.DISCONNECTED) {
      void this.events.track({
        eventName: AnalyticsEventName.HEALTH_SYNC_DISCONNECTED,
        actor: { userId, activeRole: Role.ATHLETE },
        properties: { provider },
      });
    }

    return this.toHealthSyncState(item.toObject());
  }

  // ── Data rights ─────────────────────────────────────────────────────────

  async exportProgressData(userId: string, request: Request) {
    const athleteUserId = new Types.ObjectId(userId);
    const [metrics, photos, grants, goals, reminders, healthSync] =
      await Promise.all([
        this.metricModel
          .find({ athleteUserId })
          .sort({ recordedAt: -1 })
          .lean(),
        this.photoModel.find({ athleteUserId }).sort({ capturedAt: -1 }).lean(),
        this.dataGrantModel
          .find({ athleteUserId })
          .sort({ updatedAt: -1 })
          .lean(),
        this.metricGoalModel
          .find({ athleteUserId })
          .sort({ updatedAt: -1 })
          .lean(),
        this.metricReminderModel
          .find({ athleteUserId })
          .sort({ metricKey: 1 })
          .lean(),
        this.healthSyncStateModel.find({ athleteUserId }).lean(),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      athleteUserId: userId,
      metrics: metrics.map((item) => this.toMetric(item)),
      photos: photos.map((item) => this.toPhoto(item)),
      grants: grants.map((item) => this.toDataGrant(item)),
      goals: goals.map((item) => this.toMetricGoal(item)),
      reminders: reminders.map((item) => this.toMetricReminder(item)),
      healthSync: healthSync.map((item) => this.toHealthSyncState(item)),
    };

    this.audit.log({
      action: AuditAction.PROGRESS_EXPORTED,
      actorId: userId,
      metadata: {
        kind: 'progress_export',
        counts: {
          metrics: metrics.length,
          photos: photos.length,
          grants: grants.length,
          goals: goals.length,
          reminders: reminders.length,
          healthSync: healthSync.length,
        },
      },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.PROGRESS_EXPORTED,
      actor: { userId, activeRole: Role.ATHLETE },
      properties: {
        metrics: metrics.length,
        photos: photos.length,
        grants: grants.length,
        goals: goals.length,
      },
    });

    return payload;
  }

  async deleteProgressMetrics(
    dto: DeleteProgressMetricsDto,
    userId: string,
    request: Request,
  ) {
    if (dto.confirmation !== 'DELETE_METRICS') {
      throw new BadRequestException('confirmation must be DELETE_METRICS');
    }
    const filter: QueryFilter<ProgressMetricDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (dto.metricKeys?.length) {
      filter.metricKey = { $in: dto.metricKeys.map((key) => key.trim()) };
    }
    const result = await this.metricModel.deleteMany(filter);
    this.audit.log({
      action: AuditAction.PROGRESS_METRICS_BULK_DELETED,
      actorId: userId,
      metadata: {
        kind: 'metrics_bulk_delete',
        deletedCount: result.deletedCount ?? 0,
        metricKeys: dto.metricKeys ?? null,
      },
      request,
    });
    void this.events.track({
      eventName: AnalyticsEventName.PROGRESS_METRICS_DELETED,
      actor: { userId, activeRole: Role.ATHLETE },
      properties: {
        deletedCount: result.deletedCount ?? 0,
        scoped: Boolean(dto.metricKeys?.length),
      },
    });
    return { ok: true as const, deletedCount: result.deletedCount ?? 0 };
  }

  async consentHistory(userId: string) {
    const grants = await this.dataGrantModel
      .find({ athleteUserId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();

    const events = grants.flatMap((grant) => {
      const base = {
        grantId: grant._id.toString(),
        granteeUserId: grant.grantee.userId.toString(),
        scopes: grant.scopes,
      };
      const rows: {
        type: 'granted' | 'revoked' | 'expired';
        occurredAt: string;
        grantId: string;
        granteeUserId: string;
        scopes: AthleteDataGrantScope[];
        status: AthleteDataGrantStatus;
      }[] = [
        {
          type: 'granted',
          occurredAt: grant.effective.grantedAt.toISOString(),
          ...base,
          status: AthleteDataGrantStatus.ACTIVE,
        },
      ];
      if (grant.revokedAt) {
        rows.push({
          type: 'revoked',
          occurredAt: grant.revokedAt.toISOString(),
          ...base,
          status: AthleteDataGrantStatus.REVOKED,
        });
      } else if (
        grant.status === AthleteDataGrantStatus.EXPIRED ||
        (grant.effective.expiresAt &&
          grant.effective.expiresAt.getTime() <= Date.now())
      ) {
        rows.push({
          type: 'expired',
          occurredAt: (
            grant.effective.expiresAt ?? grant.updatedAt
          ).toISOString(),
          ...base,
          status: AthleteDataGrantStatus.EXPIRED,
        });
      }
      return rows;
    });

    events.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    return {
      items: events,
      grants: grants.map((item) => this.toDataGrant(item)),
    };
  }

  private toMetricGoal(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    metricKey: string;
    target: { operator: string; value: number; unit?: string };
    period: string;
    effective: { start: Date; end?: Date };
    status: MetricGoalStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      metricKey: doc.metricKey,
      target: {
        operator: doc.target.operator,
        value: doc.target.value,
        unit: doc.target.unit ?? null,
      },
      period: doc.period,
      effective: {
        start: doc.effective.start.toISOString(),
        end: doc.effective.end?.toISOString() ?? null,
      },
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toMetricReminder(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    metricKey: string;
    schedule: { timezone: string; weekdays: number[]; localTime: string };
    quietHours?: { start?: string; end?: string };
    channel: MetricReminderChannel;
    status: MetricReminderStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      metricKey: doc.metricKey,
      schedule: {
        timezone: doc.schedule.timezone,
        weekdays: doc.schedule.weekdays ?? [],
        localTime: doc.schedule.localTime,
      },
      quietHours: doc.quietHours
        ? {
            start: doc.quietHours.start ?? null,
            end: doc.quietHours.end ?? null,
          }
        : null,
      channel: doc.channel,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toDataGrant(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    grantee: { type: AthleteDataGranteeType; userId: Types.ObjectId };
    relationshipId: Types.ObjectId;
    scopes: AthleteDataGrantScope[];
    effective: { grantedAt: Date; expiresAt?: Date };
    status: AthleteDataGrantStatus;
    revokedAt?: Date;
    revokedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      grantee: {
        type: doc.grantee.type,
        userId: doc.grantee.userId.toString(),
      },
      relationshipId: doc.relationshipId.toString(),
      scopes: doc.scopes,
      effective: {
        grantedAt: doc.effective.grantedAt.toISOString(),
        expiresAt: doc.effective.expiresAt?.toISOString() ?? null,
      },
      status: doc.status,
      revokedAt: doc.revokedAt?.toISOString() ?? null,
      revokedBy: doc.revokedBy?.toString() ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toHealthSyncState(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    provider: HealthSyncProvider;
    status: HealthSyncStatus;
    authorizedMetricKeys?: string[];
    cursorByMetric?: Record<string, string>;
    lastSyncAt?: Date;
    lastErrorCode?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      provider: doc.provider,
      status: doc.status,
      authorizedMetricKeys: doc.authorizedMetricKeys ?? [],
      cursorByMetric: doc.cursorByMetric ?? {},
      lastSyncAt: doc.lastSyncAt?.toISOString() ?? null,
      lastErrorCode: doc.lastErrorCode ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
