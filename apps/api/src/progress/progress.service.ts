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
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  ExerciseOriginKind,
  ExerciseStatus,
  MetricTypeStatus,
  MetricValueKind,
  Privacy,
  Role,
  WorkoutPlanStatus,
  WorkoutProgramOwnerType,
  WorkoutProgramStatus,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { Exercise, ExerciseDocument } from '../schemas/exercise.schema';
import {
  MetricType,
  MetricTypeDocument,
} from '../schemas/metric-type.schema';
import {
  ProgressMetric,
  ProgressMetricDocument,
} from '../schemas/progress-metric.schema';
import {
  ProgressPhoto,
  ProgressPhotoDocument,
} from '../schemas/progress-photo.schema';
import {
  WorkoutPlan,
  WorkoutPlanDocument,
} from '../schemas/workout-plan.schema';
import {
  WorkoutProgram,
  WorkoutProgramDocument,
} from '../schemas/workout-program.schema';
import {
  AssignWorkoutProgramDto,
  CreateExerciseDto,
  CreateMetricTypeDto,
  CreateProgressMetricDto,
  CreateProgressPhotoDto,
  CreateWorkoutPlanDto,
  CreateWorkoutProgramDto,
  ListExercisesQueryDto,
  ListMetricTypesQueryDto,
  ListProgressMetricsQueryDto,
  ListProgressPhotosQueryDto,
  ListWorkoutPlansQueryDto,
  ListWorkoutProgramsQueryDto,
  UpdateExerciseDto,
  UpdateMetricTypeDto,
  UpdateProgressMetricDto,
  UpdateProgressPhotoDto,
  UpdateWorkoutPlanDto,
  UpdateWorkoutProgramDto,
  WorkoutPlanWeekDto,
} from './dto/progress.dto';

const DEFAULT_METRIC_TYPES: {
  key: string;
  name: string;
  valueKind: MetricValueKind;
  unit?: string;
  sortHint: number;
  chartKind?: string;
}[] = [
  {
    key: 'weight_kg',
    name: 'Weight',
    valueKind: MetricValueKind.NUMBER,
    unit: 'kg',
    sortHint: 10,
    chartKind: 'line',
  },
  {
    key: 'heart_rate',
    name: 'Heart rate',
    valueKind: MetricValueKind.NUMBER,
    unit: 'bpm',
    sortHint: 20,
    chartKind: 'line',
  },
  {
    key: 'hydration',
    name: 'Hydration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'L',
    sortHint: 30,
    chartKind: 'stacked',
  },
  {
    key: 'blood_pressure',
    name: 'Blood pressure',
    valueKind: MetricValueKind.PAIR,
    unit: 'mmHg',
    sortHint: 40,
    chartKind: 'range',
  },
  {
    key: 'sleep',
    name: 'Sleep',
    valueKind: MetricValueKind.RATIO,
    unit: 'h',
    sortHint: 50,
    chartKind: 'rings',
  },
  {
    key: 'nutrition',
    name: 'Nutrition',
    valueKind: MetricValueKind.NUMBER,
    sortHint: 60,
    chartKind: 'dots',
  },
  {
    key: 'mood',
    name: 'Mood',
    valueKind: MetricValueKind.TEXT,
    sortHint: 70,
    chartKind: 'moods',
  },
  {
    key: 'steps',
    name: 'Steps',
    valueKind: MetricValueKind.NUMBER,
    unit: 'steps',
    sortHint: 80,
    chartKind: 'bars',
  },
  {
    key: 'respiration',
    name: 'Respiration',
    valueKind: MetricValueKind.NUMBER,
    unit: 'rpm',
    sortHint: 90,
    chartKind: 'line',
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
    private readonly audit: AuditService,
  ) {}

  // ── Exercises ───────────────────────────────────────────────────────────

  async adminListExercises(query: ListExercisesQueryDto) {
    const filter: QueryFilter<ExerciseDocument> = {};
    if (query.status) filter.status = query.status;
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
    });
    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
    if (dto.equipmentKeys !== undefined)
      item.equipmentKeys = dto.equipmentKeys;
    if (dto.mediaId !== undefined) {
      item.mediaId = dto.mediaId
        ? new Types.ObjectId(dto.mediaId)
        : undefined;
    }
    if (dto.status !== undefined) item.status = dto.status;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
      actorId: adminId,
      metadata: { kind: 'exercise_archive', exerciseId: id },
      request,
    });
    return this.toExercise(item.toObject());
  }

  /** Active exercise bank for coaches / athletes. */
  async listExercises(query: ListExercisesQueryDto) {
    const filter: QueryFilter<ExerciseDocument> = {
      status: query.status ?? ExerciseStatus.ACTIVE,
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

  // ── Workout plans ───────────────────────────────────────────────────────

  async listWorkoutPlans(
    userId: string,
    activeRole: Role,
    query: ListWorkoutPlansQueryDto,
  ) {
    const filter = this.workoutPlanAccessFilter(userId, activeRole, query);
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
    this.assertWorkoutPlanAccess(item, userId, activeRole);
    return this.toWorkoutPlan(item.toObject());
  }

  async createWorkoutPlan(
    dto: CreateWorkoutPlanDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const athleteUserId = this.resolveAthleteUserId(dto.athleteUserId, userId, activeRole);
    const coachUserId =
      activeRole === Role.COACH ? new Types.ObjectId(userId) : undefined;

    const item = await this.workoutPlanModel.create({
      athleteUserId: new Types.ObjectId(athleteUserId),
      coachUserId,
      title: dto.title.trim(),
      status: dto.status ?? WorkoutPlanStatus.DRAFT,
      privacy: dto.privacy ?? Privacy.PRIVATE,
      weeks: this.mapWeeks(dto.weeks ?? []),
      period: this.mapPeriod(dto.period),
    });

    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
    this.assertWorkoutPlanAccess(item, userId, activeRole);

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    if (dto.weeks !== undefined) item.weeks = this.mapWeeks(dto.weeks);
    if (dto.period !== undefined) {
      item.period = dto.period === null ? undefined : this.mapPeriod(dto.period);
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
    this.assertWorkoutPlanAccess(item, userId, activeRole);
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
    this.assertAthleteOnlyWrite(activeRole, 'list');
    const filter: QueryFilter<ProgressMetricDocument> = {
      athleteUserId: new Types.ObjectId(userId),
    };
    if (query.metricKey) filter.metricKey = query.metricKey;
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricModel
        .find(filter)
        .sort({ recordedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMetric(item)),
      total,
      page,
      pageSize,
    );
  }

  async createMetric(
    dto: CreateProgressMetricDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    this.assertAthleteOnlyWrite(activeRole, 'create');
    const item = await this.metricModel.create({
      athleteUserId: new Types.ObjectId(userId),
      privacy: dto.privacy ?? Privacy.PRIVATE,
      metricKey: dto.metricKey.trim(),
      value: dto.value,
      unit: dto.unit?.trim(),
      recordedAt: new Date(dto.recordedAt),
      note: dto.note?.trim(),
    });
    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
      actorId: userId,
      metadata: { kind: 'metric', metricId: item._id.toString() },
      request,
    });
    return this.toMetric(item.toObject());
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
    if (dto.value !== undefined) item.value = dto.value;
    if (dto.unit !== undefined) item.unit = dto.unit?.trim() || undefined;
    if (dto.recordedAt !== undefined) item.recordedAt = new Date(dto.recordedAt);
    if (dto.note !== undefined) item.note = dto.note?.trim() || undefined;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    await item.save();
    this.audit.log({
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
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
      action: AuditAction.WORKOUT_PLAN_UPSERTED,
      actorId: userId,
      metadata: { kind: 'photo_delete', photoId: id },
      request,
    });
    return { ok: true };
  }

  // ── Metric types ────────────────────────────────────────────────────────

  async adminListMetricTypes(query: ListMetricTypesQueryDto) {
    await this.ensureDefaultMetricTypes();
    const filter: QueryFilter<MetricTypeDocument> = {};
    if (query.status) filter.status = query.status;
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
        unit: dto.unit?.trim(),
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

  async listWorkoutPrograms(coachUserId: string, query: ListWorkoutProgramsQueryDto) {
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

    const plan = await this.workoutPlanModel.create({
      athleteUserId: new Types.ObjectId(dto.athleteUserId),
      coachUserId: new Types.ObjectId(coachUserId),
      programId: program._id,
      title: program.title,
      status: dto.status ?? WorkoutPlanStatus.ACTIVE,
      privacy: dto.privacy ?? program.privacy ?? Privacy.PRIVATE,
      weeks: program.weeks ?? [],
      period: this.mapPeriod(dto.period),
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
        throw new ForbiddenException('Athletes can only manage their own plans');
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

  private workoutPlanAccessFilter(
    userId: string,
    activeRole: Role,
    query: ListWorkoutPlansQueryDto,
  ): QueryFilter<WorkoutPlanDocument> {
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
      // Authoring coach can list plans they created (v1; no CoachStudent check).
      filter.coachUserId = new Types.ObjectId(userId);
      if (query.athleteUserId) {
        filter.athleteUserId = new Types.ObjectId(query.athleteUserId);
      }
      return filter;
    }
    throw new ForbiddenException('Role cannot list workout plans');
  }

  private assertWorkoutPlanAccess(
    plan: WorkoutPlanDocument,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.ADMIN) return;
    const uid = userId;
    if (plan.athleteUserId.toString() === uid) return;
    if (
      activeRole === Role.COACH &&
      plan.coachUserId?.toString() === uid
    ) {
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
    const count = await this.metricTypeModel.estimatedDocumentCount();
    if (count > 0) return;
    try {
      await this.metricTypeModel.insertMany(
        DEFAULT_METRIC_TYPES.map((row) => ({
          ...row,
          status: MetricTypeStatus.ACTIVE,
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

  private toExercise(doc: {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    muscleKeys?: string[];
    equipmentKeys?: string[];
    mediaId?: Types.ObjectId;
    status: ExerciseStatus;
    origin: { kind: ExerciseOriginKind; userId?: Types.ObjectId };
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
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  private toMetricType(doc: {
    _id: Types.ObjectId;
    key: string;
    name: string;
    valueKind: MetricValueKind;
    unit?: string;
    sportId?: string;
    status: MetricTypeStatus;
    sortHint: number;
    chartKind?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      key: doc.key,
      name: doc.name,
      valueKind: doc.valueKind,
      unit: doc.unit ?? null,
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
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      privacy: doc.privacy,
      metricKey: doc.metricKey,
      value: doc.value,
      unit: doc.unit ?? null,
      recordedAt: doc.recordedAt.toISOString(),
      note: doc.note ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
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
}
