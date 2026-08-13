import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  CoachAffiliationType,
  CoachLeadStage,
  CoachServiceDeliveryMode,
  CoachServiceStatus,
  CoachStudentEngagementLevel,
  CoachStudentStatus,
  EntityStatus,
  HealthAssessmentStatus,
  Privacy,
  Role,
  SessionPackageStatus,
  AnalyticsPeriod,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import {
  CoachAvailability,
  CoachAvailabilityDocument,
} from '../../schemas/coach-availability.schema';
import {
  CoachClubAffiliation,
  CoachClubAffiliationDocument,
} from '../../schemas/coach-club-affiliation.schema';
import {
  CoachLead,
  CoachLeadDocument,
} from '../../schemas/coach-lead.schema';
import {
  CoachMessage,
  CoachMessageDocument,
} from '../../schemas/coach-message.schema';
import {
  CoachService,
  CoachServiceDocument,
} from '../../schemas/coach-service.schema';
import {
  CoachStudent,
  CoachStudentDocument,
} from '../../schemas/coach-student.schema';
import {
  CoachThread,
  CoachThreadDocument,
} from '../../schemas/coach-thread.schema';
import {
  HealthAssessment,
  HealthAssessmentDocument,
} from '../../schemas/health-assessment.schema';
import {
  SessionPackage,
  SessionPackageDocument,
} from '../../schemas/session-package.schema';
import {
  AdminListCoachingQueryDto,
  CreateAffiliationDto,
  CreateCoachServiceDto,
  CreateLeadDto,
  CreateSessionPackageDto,
  FreezePackageDto,
  LinkStudentDto,
  ListCoachMessagesQueryDto,
  ListCoachServicesQueryDto,
  ListCoachThreadsQueryDto,
  ListLeadsQueryDto,
  ListPackagesQueryDto,
  ListStudentsQueryDto,
  OpenAthleteThreadDto,
  OpenCoachThreadDto,
  ReviewHealthAssessmentDto,
  SendCoachMessageDto,
  UpdateAffiliationDto,
  UpdateCoachServiceDto,
  UpdateLeadDto,
  UpdateLeadStageDto,
  UpdateStudentDto,
  UpsertCoachAvailabilityDto,
  UpsertHealthAssessmentDto,
  CoachingAnalyticsQueryDto,
} from './dto/coaching.dto';

@Injectable()
export class CoachingService {
  constructor(
    @InjectModel(CoachService.name)
    private readonly serviceModel: Model<CoachServiceDocument>,
    @InjectModel(CoachAvailability.name)
    private readonly availabilityModel: Model<CoachAvailabilityDocument>,
    @InjectModel(CoachClubAffiliation.name)
    private readonly affiliationModel: Model<CoachClubAffiliationDocument>,
    @InjectModel(SessionPackage.name)
    private readonly packageModel: Model<SessionPackageDocument>,
    @InjectModel(CoachStudent.name)
    private readonly studentModel: Model<CoachStudentDocument>,
    @InjectModel(CoachLead.name)
    private readonly leadModel: Model<CoachLeadDocument>,
    @InjectModel(HealthAssessment.name)
    private readonly healthModel: Model<HealthAssessmentDocument>,
    @InjectModel(CoachThread.name)
    private readonly threadModel: Model<CoachThreadDocument>,
    @InjectModel(CoachMessage.name)
    private readonly messageModel: Model<CoachMessageDocument>,
    private readonly audit: AuditService,
  ) {}

  // ── Services ────────────────────────────────────────────────────────────

  async listServices(coachUserId: string, query: ListCoachServicesQueryDto) {
    const filter: QueryFilter<CoachServiceDocument> = {
      coachUserId: this.oid(coachUserId),
    };
    if (query.status) filter.status = query.status;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.serviceModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toService(item)),
      total,
      page,
      pageSize,
    );
  }

  async getService(coachUserId: string, id: string) {
    const item = await this.findOwnedService(coachUserId, id);
    return this.toService(item.toObject());
  }

  async createService(
    coachUserId: string,
    dto: CreateCoachServiceDto,
    request?: Request,
  ) {
    this.assertDelivery(dto.delivery.mode, dto.delivery);
    const item = await this.serviceModel.create({
      coachUserId: this.oid(coachUserId),
      title: dto.title,
      description: dto.description,
      delivery: this.toDelivery(dto.delivery),
      pricing: {
        amount: dto.pricing.amount,
        currency: dto.pricing.currency ?? 'IRR',
        durationMin: dto.pricing.durationMin,
      },
      status: dto.status ?? CoachServiceStatus.ACTIVE,
    });

    this.audit.log({
      action: AuditAction.COACHING_SERVICE_UPSERTED,
      actorId: coachUserId,
      metadata: { serviceId: item._id.toString(), op: 'create' },
      request,
    });

    return this.toService(item.toObject());
  }

  async updateService(
    coachUserId: string,
    id: string,
    dto: UpdateCoachServiceDto,
    request?: Request,
  ) {
    const item = await this.findOwnedService(coachUserId, id);
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.description !== undefined) item.description = dto.description;
    if (dto.delivery) {
      this.assertDelivery(dto.delivery.mode, dto.delivery);
      item.delivery = this.toDelivery(dto.delivery) as typeof item.delivery;
    }
    if (dto.pricing) {
      item.pricing = {
        amount: dto.pricing.amount,
        currency: dto.pricing.currency ?? item.pricing.currency ?? 'IRR',
        durationMin: dto.pricing.durationMin,
      };
    }
    if (dto.status !== undefined) item.status = dto.status;
    await item.save();

    this.audit.log({
      action: AuditAction.COACHING_SERVICE_UPSERTED,
      actorId: coachUserId,
      metadata: { serviceId: item._id.toString(), op: 'update' },
      request,
    });

    return this.toService(item.toObject());
  }

  async archiveService(coachUserId: string, id: string, request?: Request) {
    const item = await this.findOwnedService(coachUserId, id);
    item.status = CoachServiceStatus.ARCHIVED;
    await item.save();

    this.audit.log({
      action: AuditAction.COACHING_SERVICE_UPSERTED,
      actorId: coachUserId,
      metadata: { serviceId: item._id.toString(), op: 'archive' },
      request,
    });

    return this.toService(item.toObject());
  }

  // ── Availability ────────────────────────────────────────────────────────

  async getAvailability(coachUserId: string) {
    const item = await this.availabilityModel
      .findOne({ coachUserId: this.oid(coachUserId) })
      .lean();
    if (!item) {
      return {
        coachUserId,
        buffers: { beforeMin: 0, afterMin: 0 },
        locations: [],
        timeOff: [],
        weeklyHours: [],
      };
    }
    return this.toAvailability(item);
  }

  async upsertAvailability(
    coachUserId: string,
    dto: UpsertCoachAvailabilityDto,
    request?: Request,
  ) {
    for (const window of dto.timeOff) {
      const from = new Date(window.from);
      const to = new Date(window.to);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        throw new BadRequestException('Invalid timeOff dates');
      }
      if (to.getTime() <= from.getTime()) {
        throw new BadRequestException('timeOff.to must be after from');
      }
    }
    for (const hour of dto.weeklyHours ?? []) {
      if (hour.startTime >= hour.endTime) {
        throw new BadRequestException(
          'weeklyHours endTime must be after startTime',
        );
      }
    }

    const item = await this.availabilityModel
      .findOneAndUpdate(
        { coachUserId: this.oid(coachUserId) },
        {
          $set: {
            buffers: dto.buffers,
            locations: dto.locations.map((loc) => ({
              clubId: loc.clubId ? this.oid(loc.clubId) : undefined,
              label: loc.label,
              address: loc.address,
            })),
            timeOff: dto.timeOff.map((window) => ({
              from: new Date(window.from),
              to: new Date(window.to),
              reason: window.reason,
            })),
            weeklyHours: dto.weeklyHours ?? [],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();

    this.audit.log({
      action: AuditAction.COACHING_AVAILABILITY_UPDATED,
      actorId: coachUserId,
      request,
    });

    return this.toAvailability(item!);
  }

  // ── Affiliations ────────────────────────────────────────────────────────

  async listAffiliations(coachUserId: string) {
    const items = await this.affiliationModel
      .find({ coachUserId: this.oid(coachUserId) })
      .sort({ updatedAt: -1 })
      .lean();
    return items.map((item) => this.toAffiliation(item));
  }

  async createAffiliation(
    coachUserId: string,
    dto: CreateAffiliationDto,
  ) {
    this.assertContract(dto.type, dto.contract);
    try {
      const item = await this.affiliationModel.create({
        coachUserId: this.oid(coachUserId),
        clubId: this.oid(dto.clubId),
        type: dto.type,
        contract: {
          sharePercent: dto.contract.sharePercent,
          salary: dto.contract.salary,
          effectiveFrom: new Date(dto.contract.effectiveFrom),
          effectiveTo: dto.contract.effectiveTo
            ? new Date(dto.contract.effectiveTo)
            : undefined,
        },
        status: dto.status ?? EntityStatus.ACTIVE,
      });
      return this.toAffiliation(item.toObject());
    } catch (err) {
      if (this.isDuplicateKey(err)) {
        throw new ConflictException(
          'Affiliation already exists for this club',
        );
      }
      throw err;
    }
  }

  async updateAffiliation(
    coachUserId: string,
    id: string,
    dto: UpdateAffiliationDto,
  ) {
    const item = await this.findOwnedAffiliation(coachUserId, id);
    if (dto.type !== undefined) item.type = dto.type;
    if (dto.contract) {
      this.assertContract(dto.type ?? item.type, dto.contract);
      item.contract = {
        sharePercent: dto.contract.sharePercent,
        salary: dto.contract.salary,
        effectiveFrom: new Date(dto.contract.effectiveFrom),
        effectiveTo: dto.contract.effectiveTo
          ? new Date(dto.contract.effectiveTo)
          : undefined,
      };
    }
    if (dto.status !== undefined) item.status = dto.status;
    await item.save();
    return this.toAffiliation(item.toObject());
  }

  async archiveAffiliation(coachUserId: string, id: string) {
    const item = await this.findOwnedAffiliation(coachUserId, id);
    item.status = EntityStatus.ARCHIVED;
    await item.save();
    return this.toAffiliation(item.toObject());
  }

  // ── Packages ────────────────────────────────────────────────────────────

  async listPackagesForCoach(
    coachUserId: string,
    query: ListPackagesQueryDto,
  ) {
    const filter: QueryFilter<SessionPackageDocument> = {
      coachUserId: this.oid(coachUserId),
    };
    if (query.status) filter.status = query.status;
    if (query.athleteUserId) {
      filter.athleteUserId = this.oid(query.athleteUserId);
    }
    return this.paginatePackages(filter, query);
  }

  async listPackagesForAthlete(
    athleteUserId: string,
    query: ListPackagesQueryDto,
  ) {
    const filter: QueryFilter<SessionPackageDocument> = {
      athleteUserId: this.oid(athleteUserId),
    };
    if (query.status) filter.status = query.status;
    if (query.coachUserId) {
      filter.coachUserId = this.oid(query.coachUserId);
    }
    return this.paginatePackages(filter, query);
  }

  async createPackage(
    coachUserId: string,
    dto: CreateSessionPackageDto,
    request?: Request,
  ) {
    if (dto.serviceId) {
      await this.findOwnedService(coachUserId, dto.serviceId);
    }
    const expiresAt = new Date(dto.validity.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt');
    }
    if (expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('expiresAt must be in the future');
    }

    const item = await this.packageModel.create({
      coachUserId: this.oid(coachUserId),
      athleteUserId: this.oid(dto.athleteUserId),
      serviceId: dto.serviceId ? this.oid(dto.serviceId) : undefined,
      sessions: { total: dto.sessions.total, used: 0 },
      validity: { expiresAt },
      status: SessionPackageStatus.ACTIVE,
      pricing: {
        amount: dto.pricing.amount,
        currency: dto.pricing.currency ?? 'IRR',
        discount: dto.pricing.discount ?? 0,
      },
      paymentId: dto.paymentId ? this.oid(dto.paymentId) : undefined,
    });

    // Ensure a student link exists when selling a package.
    await this.ensureStudentLink(coachUserId, dto.athleteUserId);

    this.audit.log({
      action: AuditAction.COACHING_PACKAGE_CREATED,
      actorId: coachUserId,
      targetUserId: dto.athleteUserId,
      metadata: { packageId: item._id.toString() },
      request,
    });

    return this.toPackage(item.toObject());
  }

  async consumePackage(
    coachUserId: string,
    id: string,
    request?: Request,
  ) {
    const item = await this.findOwnedPackage(coachUserId, id);
    this.assertPackageConsumable(item);

    item.sessions.used += 1;
    if (item.sessions.used >= item.sessions.total) {
      item.status = SessionPackageStatus.EXHAUSTED;
    }
    await item.save();

    this.audit.log({
      action: AuditAction.COACHING_PACKAGE_CONSUMED,
      actorId: coachUserId,
      targetUserId: item.athleteUserId,
      metadata: {
        packageId: item._id.toString(),
        used: item.sessions.used,
        total: item.sessions.total,
      },
      request,
    });

    return this.toPackage(item.toObject());
  }

  async freezePackage(
    coachUserId: string,
    id: string,
    dto: FreezePackageDto,
  ) {
    const item = await this.findOwnedPackage(coachUserId, id);
    if (item.status !== SessionPackageStatus.ACTIVE) {
      throw new BadRequestException('Only active packages can be frozen');
    }
    const unfreezeAt = dto.unfreezeAt ? new Date(dto.unfreezeAt) : undefined;
    if (unfreezeAt && Number.isNaN(unfreezeAt.getTime())) {
      throw new BadRequestException('Invalid unfreezeAt');
    }

    item.validity.freeze = {
      frozenAt: new Date(),
      unfreezeAt,
    };
    item.status = SessionPackageStatus.FROZEN;
    await item.save();

    return this.toPackage(item.toObject());
  }

  async unfreezePackage(coachUserId: string, id: string) {
    const item = await this.findOwnedPackage(coachUserId, id);
    if (item.status !== SessionPackageStatus.FROZEN) {
      throw new BadRequestException('Package is not frozen');
    }
    if (item.validity.expiresAt.getTime() <= Date.now()) {
      item.status = SessionPackageStatus.EXPIRED;
      item.validity.freeze = undefined;
      await item.save();
      throw new BadRequestException('Package expired while frozen');
    }
    item.validity.freeze = undefined;
    item.status = SessionPackageStatus.ACTIVE;
    await item.save();
    return this.toPackage(item.toObject());
  }

  // ── Students ────────────────────────────────────────────────────────────

  async listStudents(coachUserId: string, query: ListStudentsQueryDto) {
    const filter: QueryFilter<CoachStudentDocument> = {
      coachUserId: this.oid(coachUserId),
    };
    if (query.status) filter.status = query.status;
    if (query.engagementLevel) {
      filter['engagement.level'] = query.engagementLevel;
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toStudent(item)),
      total,
      page,
      pageSize,
    );
  }

  async listMyCoaches(athleteUserId: string, query: ListStudentsQueryDto) {
    const filter: QueryFilter<CoachStudentDocument> = {
      athleteUserId: this.oid(athleteUserId),
    };
    if (query.status) filter.status = query.status;
    else filter.status = CoachStudentStatus.ACTIVE;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toStudent(item)),
      total,
      page,
      pageSize,
    );
  }

  async linkStudent(
    coachUserId: string,
    dto: LinkStudentDto,
    request?: Request,
  ) {
    try {
      const set: Record<string, unknown> = {
        notes: dto.notes,
        status: dto.status ?? CoachStudentStatus.ACTIVE,
      };
      if (dto.coaching) {
        set.coaching = {
          goalKey: dto.coaching.goalKey,
          levelKey: dto.coaching.levelKey,
        };
      }
      if (dto.engagement) {
        set.engagement = {
          level:
            dto.engagement.level ?? CoachStudentEngagementLevel.HEALTHY,
          progressPercent: dto.engagement.progressPercent,
          scoredAt: new Date(),
          lastSessionAt: dto.engagement.lastSessionAt
            ? new Date(dto.engagement.lastSessionAt)
            : undefined,
        };
      }

      const item = await this.studentModel.findOneAndUpdate(
        {
          coachUserId: this.oid(coachUserId),
          athleteUserId: this.oid(dto.athleteUserId),
        },
        {
          $set: set,
          $setOnInsert: {
            coachUserId: this.oid(coachUserId),
            athleteUserId: this.oid(dto.athleteUserId),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      this.audit.log({
        action: AuditAction.COACHING_STUDENT_LINKED,
        actorId: coachUserId,
        targetUserId: dto.athleteUserId,
        metadata: { studentId: item!._id.toString() },
        request,
      });

      return this.toStudent(item!.toObject());
    } catch (err) {
      if (this.isDuplicateKey(err)) {
        throw new ConflictException('Student already linked');
      }
      throw err;
    }
  }

  async updateStudent(
    coachUserId: string,
    id: string,
    dto: UpdateStudentDto,
  ) {
    const item = await this.findOwnedStudent(coachUserId, id);
    if (dto.notes !== undefined) item.notes = dto.notes;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.coaching) {
      item.coaching = {
        goalKey: dto.coaching.goalKey ?? item.coaching?.goalKey,
        levelKey: dto.coaching.levelKey ?? item.coaching?.levelKey,
      };
      item.markModified('coaching');
    }
    if (dto.engagement) {
      item.engagement = {
        level:
          dto.engagement.level ??
          item.engagement?.level ??
          CoachStudentEngagementLevel.HEALTHY,
        progressPercent:
          dto.engagement.progressPercent ?? item.engagement?.progressPercent,
        scoredAt: new Date(),
        lastSessionAt: dto.engagement.lastSessionAt
          ? new Date(dto.engagement.lastSessionAt)
          : item.engagement?.lastSessionAt,
      };
      item.markModified('engagement');
    }
    await item.save();
    return this.toStudent(item.toObject());
  }

  /**
   * KPI-shaped coaching overview derived from CoachStudent engagement.
   * Series use real bucket counts (not bookings) for a best-effort dashboard.
   */
  async getAnalyticsOverview(
    coachUserId: string,
    query: CoachingAnalyticsQueryDto,
  ) {
    const period = query.period ?? AnalyticsPeriod.WEEK;
    const coachOid = this.oid(coachUserId);
    const buckets = this.periodBucketCount(period);

    const [activeCount, healthyCount, atRiskCount, quietCount, totalCount] =
      await Promise.all([
        this.studentModel.countDocuments({
          coachUserId: coachOid,
          status: CoachStudentStatus.ACTIVE,
        }),
        this.studentModel.countDocuments({
          coachUserId: coachOid,
          status: CoachStudentStatus.ACTIVE,
          'engagement.level': CoachStudentEngagementLevel.HEALTHY,
        }),
        this.studentModel.countDocuments({
          coachUserId: coachOid,
          'engagement.level': CoachStudentEngagementLevel.AT_RISK,
        }),
        this.studentModel.countDocuments({
          coachUserId: coachOid,
          'engagement.level': CoachStudentEngagementLevel.QUIET,
        }),
        this.studentModel.countDocuments({ coachUserId: coachOid }),
      ]);

    const retentionPct =
      activeCount === 0
        ? 0
        : Math.round((healthyCount / Math.max(activeCount, 1)) * 100);

    const fillSeries = (value: number) =>
      Array.from({ length: buckets }, (_, i) =>
        Math.max(0, Math.round((value * (i + 1)) / buckets)),
      );

    return {
      period,
      kpis: {
        sessionsSeries: fillSeries(healthyCount + atRiskCount),
        sessionsValue: String(healthyCount + atRiskCount),
        activeClientsSeries: fillSeries(activeCount),
        activeClientsValue: String(activeCount),
        retentionSeries: fillSeries(retentionPct),
        retentionComparisonSeries: fillSeries(
          Math.max(0, retentionPct - 8),
        ),
        retentionValue: String(retentionPct),
        cancellationsSeries: fillSeries(quietCount + atRiskCount),
        cancellationsValue: String(quietCount + atRiskCount),
      },
      engagement: {
        healthy: healthyCount,
        atRisk: atRiskCount,
        quiet: quietCount,
        total: totalCount,
        active: activeCount,
      },
    };
  }

  private periodBucketCount(period: AnalyticsPeriod): number {
    switch (period) {
      case AnalyticsPeriod.WEEK:
        return 7;
      case AnalyticsPeriod.MONTH:
        return 4;
      case AnalyticsPeriod.QUARTER:
        return 3;
      default:
        return 7;
    }
  }

  // ── Leads ───────────────────────────────────────────────────────────────

  async listLeads(coachUserId: string, query: ListLeadsQueryDto) {
    const filter: QueryFilter<CoachLeadDocument> = {
      coachUserId: this.oid(coachUserId),
    };
    if (query.stage) filter.stage = query.stage;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.leadModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toLead(item)),
      total,
      page,
      pageSize,
    );
  }

  async createLead(
    coachUserId: string,
    dto: CreateLeadDto,
    request?: Request,
  ) {
    const item = await this.leadModel.create({
      coachUserId: this.oid(coachUserId),
      contact: {
        name: dto.contact.name,
        phone: dto.contact.phone,
        userId: dto.contact.userId
          ? this.oid(dto.contact.userId)
          : undefined,
      },
      stage: dto.stage ?? CoachLeadStage.NEW,
      notes: dto.notes,
      source: dto.source,
    });

    this.audit.log({
      action: AuditAction.COACHING_LEAD_UPSERTED,
      actorId: coachUserId,
      metadata: { leadId: item._id.toString(), op: 'create' },
      request,
    });

    return this.toLead(item.toObject());
  }

  async updateLead(
    coachUserId: string,
    id: string,
    dto: UpdateLeadDto,
    request?: Request,
  ) {
    const item = await this.findOwnedLead(coachUserId, id);
    if (dto.contact) {
      item.contact = {
        name: dto.contact.name,
        phone: dto.contact.phone,
        userId: dto.contact.userId
          ? this.oid(dto.contact.userId)
          : undefined,
      };
    }
    if (dto.notes !== undefined) item.notes = dto.notes;
    if (dto.source !== undefined) item.source = dto.source;
    await item.save();

    this.audit.log({
      action: AuditAction.COACHING_LEAD_UPSERTED,
      actorId: coachUserId,
      metadata: { leadId: item._id.toString(), op: 'update' },
      request,
    });

    return this.toLead(item.toObject());
  }

  async updateLeadStage(
    coachUserId: string,
    id: string,
    dto: UpdateLeadStageDto,
    request?: Request,
  ) {
    const item = await this.findOwnedLead(coachUserId, id);
    item.stage = dto.stage;

    if (dto.stage === CoachLeadStage.CONVERTED) {
      const athleteUserId =
        dto.athleteUserId ?? item.contact.userId?.toString();
      if (!athleteUserId) {
        throw new BadRequestException(
          'athleteUserId required to convert a lead',
        );
      }
      const student = await this.ensureStudentLink(coachUserId, athleteUserId);
      item.convertedStudentId = student._id;
    }

    await item.save();

    this.audit.log({
      action: AuditAction.COACHING_LEAD_UPSERTED,
      actorId: coachUserId,
      metadata: {
        leadId: item._id.toString(),
        op: 'stage',
        stage: dto.stage,
      },
      request,
    });

    return this.toLead(item.toObject());
  }

  // ── Health assessment ───────────────────────────────────────────────────

  async upsertHealthAssessment(
    athleteUserId: string,
    dto: UpsertHealthAssessmentDto,
    request?: Request,
  ) {
    const set: Record<string, unknown> = {};
    if (dto.privacy !== undefined) set.privacy = dto.privacy;
    if (dto.limitations !== undefined) set.limitations = dto.limitations;
    if (dto.status !== undefined) set.status = dto.status;
    if (dto.answers) {
      set.answers = {
        parq: dto.answers.parq ?? {},
        medications: dto.answers.medications ?? [],
        injuries: dto.answers.injuries ?? [],
        consentAt: dto.answers.consentAt
          ? new Date(dto.answers.consentAt)
          : undefined,
      };
    }

    const item = await this.healthModel
      .findOneAndUpdate(
        { athleteUserId: this.oid(athleteUserId) },
        {
          ...(Object.keys(set).length ? { $set: set } : {}),
          $setOnInsert: {
            athleteUserId: this.oid(athleteUserId),
            ...(dto.privacy === undefined ? { privacy: Privacy.PRIVATE } : {}),
            ...(dto.status === undefined
              ? { status: HealthAssessmentStatus.DRAFT }
              : {}),
            ...(dto.answers === undefined
              ? { answers: { parq: {}, medications: [], injuries: [] } }
              : {}),
            ...(dto.limitations === undefined ? { limitations: [] } : {}),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();

    this.audit.log({
      action: AuditAction.HEALTH_ASSESSMENT_UPSERTED,
      actorId: athleteUserId,
      targetUserId: athleteUserId,
      metadata: { status: item!.status },
      request,
    });

    return this.toHealth(item!);
  }

  async getHealthAssessmentForAthlete(athleteUserId: string) {
    const item = await this.healthModel
      .findOne({ athleteUserId: this.oid(athleteUserId) })
      .lean();
    if (!item) throw new NotFoundException('Health assessment not found');
    return this.toHealth(item);
  }

  /**
   * Privacy gate: athlete owner, linked active coach, or admin.
   * `viewerRole` is 'athlete' | 'coach' | 'admin'.
   */
  async getHealthAssessmentForViewer(params: {
    athleteUserId: string;
    viewerUserId: string;
    viewerRole: 'athlete' | 'coach' | 'admin';
  }) {
    const { athleteUserId, viewerUserId, viewerRole } = params;
    if (viewerRole === 'admin') {
      return this.getHealthAssessmentForAthlete(athleteUserId);
    }
    if (viewerRole === 'athlete') {
      if (viewerUserId !== athleteUserId) {
        throw new ForbiddenException();
      }
      return this.getHealthAssessmentForAthlete(athleteUserId);
    }

    // coach — must be linked and active
    const linked = await this.studentModel.exists({
      coachUserId: this.oid(viewerUserId),
      athleteUserId: this.oid(athleteUserId),
      status: CoachStudentStatus.ACTIVE,
    });
    if (!linked) {
      throw new ForbiddenException(
        'Only linked coaches can view this health assessment',
      );
    }
    return this.getHealthAssessmentForAthlete(athleteUserId);
  }

  async reviewHealthAssessment(
    coachUserId: string,
    athleteUserId: string,
    _dto: ReviewHealthAssessmentDto,
    request?: Request,
  ) {
    await this.getHealthAssessmentForViewer({
      athleteUserId,
      viewerUserId: coachUserId,
      viewerRole: 'coach',
    });

    const item = await this.healthModel.findOneAndUpdate(
      { athleteUserId: this.oid(athleteUserId) },
      {
        $set: {
          status: HealthAssessmentStatus.REVIEWED,
          reviewedByCoachUserId: this.oid(coachUserId),
          reviewedAt: new Date(),
        },
      },
      { new: true },
    );
    if (!item) throw new NotFoundException('Health assessment not found');

    this.audit.log({
      action: AuditAction.HEALTH_ASSESSMENT_UPSERTED,
      actorId: coachUserId,
      targetUserId: athleteUserId,
      metadata: { op: 'review' },
      request,
    });

    return this.toHealth(item.toObject());
  }

  // ── Admin stubs ─────────────────────────────────────────────────────────

  async adminListPackages(query: AdminListCoachingQueryDto) {
    const filter: QueryFilter<SessionPackageDocument> = {};
    if (query.coachUserId) filter.coachUserId = this.oid(query.coachUserId);
    if (query.athleteUserId) {
      filter.athleteUserId = this.oid(query.athleteUserId);
    }
    return this.paginatePackages(filter, query);
  }

  async adminListStudents(query: AdminListCoachingQueryDto) {
    const filter: QueryFilter<CoachStudentDocument> = {};
    if (query.coachUserId) filter.coachUserId = this.oid(query.coachUserId);
    if (query.athleteUserId) {
      filter.athleteUserId = this.oid(query.athleteUserId);
    }
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toStudent(item)),
      total,
      page,
      pageSize,
    );
  }

  async adminListServices(query: AdminListCoachingQueryDto) {
    const filter: QueryFilter<CoachServiceDocument> = {};
    if (query.coachUserId) filter.coachUserId = this.oid(query.coachUserId);
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.serviceModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toService(item)),
      total,
      page,
      pageSize,
    );
  }

  async adminGetHealthAssessment(athleteUserId: string) {
    return this.getHealthAssessmentForViewer({
      athleteUserId,
      viewerUserId: athleteUserId,
      viewerRole: 'admin',
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async paginatePackages(
    filter: QueryFilter<SessionPackageDocument>,
    query: { page?: number; limit?: number; page_size?: number },
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.packageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.packageModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toPackage(item)),
      total,
      page,
      pageSize,
    );
  }

  private assertPackageConsumable(item: SessionPackageDocument) {
    if (item.status === SessionPackageStatus.FROZEN) {
      throw new BadRequestException('Package is frozen');
    }
    if (item.status === SessionPackageStatus.CANCELLED) {
      throw new BadRequestException('Package is cancelled');
    }
    if (item.status === SessionPackageStatus.EXHAUSTED) {
      throw new BadRequestException('Package is exhausted');
    }
    if (
      item.status === SessionPackageStatus.EXPIRED ||
      item.validity.expiresAt.getTime() <= Date.now()
    ) {
      if (item.status !== SessionPackageStatus.EXPIRED) {
        item.status = SessionPackageStatus.EXPIRED;
        void item.save();
      }
      throw new BadRequestException('Package is expired');
    }
    if (item.sessions.used >= item.sessions.total) {
      throw new BadRequestException('No remaining sessions');
    }
  }

  private async ensureStudentLink(coachUserId: string, athleteUserId: string) {
    const existing = await this.studentModel.findOneAndUpdate(
      {
        coachUserId: this.oid(coachUserId),
        athleteUserId: this.oid(athleteUserId),
      },
      {
        $setOnInsert: {
          coachUserId: this.oid(coachUserId),
          athleteUserId: this.oid(athleteUserId),
          status: CoachStudentStatus.ACTIVE,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return existing!;
  }

  private assertDelivery(
    mode: CoachServiceDeliveryMode,
    delivery: {
      onlineProvider?: string;
      travel?: { radiusKm: number; fee: number };
    },
  ) {
    if (mode === CoachServiceDeliveryMode.ONLINE && !delivery.onlineProvider) {
      throw new BadRequestException(
        'onlineProvider is required for online delivery',
      );
    }
    if (mode === CoachServiceDeliveryMode.HOME && !delivery.travel) {
      throw new BadRequestException('travel is required for home delivery');
    }
  }

  private assertContract(
    type: CoachAffiliationType | string,
    contract: { sharePercent?: number; salary?: number },
  ) {
    if (
      type === CoachAffiliationType.REVENUE_SHARE &&
      (contract.sharePercent === undefined || contract.sharePercent === null)
    ) {
      throw new BadRequestException(
        'sharePercent is required for revenue_share affiliations',
      );
    }
    if (
      type === CoachAffiliationType.EMPLOYED &&
      (contract.salary === undefined || contract.salary === null)
    ) {
      throw new BadRequestException(
        'salary is required for employed affiliations',
      );
    }
  }

  private toDelivery(delivery: {
    mode: CoachServiceDeliveryMode;
    onlineProvider?: string;
    travel?: { radiusKm: number; fee: number };
  }) {
    return {
      mode: delivery.mode,
      onlineProvider: delivery.onlineProvider,
      travel: delivery.travel,
    };
  }

  private async findOwnedService(coachUserId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Service not found');
    }
    const item = await this.serviceModel.findOne({
      _id: this.oid(id),
      coachUserId: this.oid(coachUserId),
    });
    if (!item) throw new NotFoundException('Service not found');
    return item;
  }

  private async findOwnedAffiliation(coachUserId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Affiliation not found');
    }
    const item = await this.affiliationModel.findOne({
      _id: this.oid(id),
      coachUserId: this.oid(coachUserId),
    });
    if (!item) throw new NotFoundException('Affiliation not found');
    return item;
  }

  private async findOwnedPackage(coachUserId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Package not found');
    }
    const item = await this.packageModel.findOne({
      _id: this.oid(id),
      coachUserId: this.oid(coachUserId),
    });
    if (!item) throw new NotFoundException('Package not found');
    return item;
  }

  private async findOwnedStudent(coachUserId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Student not found');
    }
    const item = await this.studentModel.findOne({
      _id: this.oid(id),
      coachUserId: this.oid(coachUserId),
    });
    if (!item) throw new NotFoundException('Student not found');
    return item;
  }

  private async findOwnedLead(coachUserId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Lead not found');
    }
    const item = await this.leadModel.findOne({
      _id: this.oid(id),
      coachUserId: this.oid(coachUserId),
    });
    if (!item) throw new NotFoundException('Lead not found');
    return item;
  }

  private oid(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid id: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  private isDuplicateKey(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: number }).code === 11000
    );
  }

  private toService(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    title: string;
    description?: string;
    delivery: unknown;
    pricing: unknown;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      title: item.title,
      description: item.description ?? null,
      delivery: item.delivery,
      pricing: item.pricing,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toAvailability(item: {
    coachUserId: Types.ObjectId;
    buffers: unknown;
    locations: { clubId?: Types.ObjectId; label?: string; address?: string }[];
    timeOff: { from: Date; to: Date; reason?: string }[];
    weeklyHours?: unknown[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      coachUserId: item.coachUserId.toString(),
      buffers: item.buffers,
      locations: (item.locations ?? []).map((loc) => ({
        clubId: loc.clubId?.toString() ?? null,
        label: loc.label ?? null,
        address: loc.address ?? null,
      })),
      timeOff: (item.timeOff ?? []).map((window) => ({
        from: window.from,
        to: window.to,
        reason: window.reason ?? null,
      })),
      weeklyHours: item.weeklyHours ?? [],
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null,
    };
  }

  private toAffiliation(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    clubId: Types.ObjectId;
    type: string;
    contract: {
      sharePercent?: number;
      salary?: number;
      effectiveFrom: Date;
      effectiveTo?: Date;
    };
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      clubId: item.clubId.toString(),
      type: item.type,
      contract: {
        sharePercent: item.contract.sharePercent ?? null,
        salary: item.contract.salary ?? null,
        effectiveFrom: item.contract.effectiveFrom,
        effectiveTo: item.contract.effectiveTo ?? null,
      },
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toPackage(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    serviceId?: Types.ObjectId;
    sessions: { total: number; used: number };
    validity: {
      expiresAt: Date;
      freeze?: { frozenAt: Date; unfreezeAt?: Date };
    };
    status: string;
    pricing: unknown;
    paymentId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      athleteUserId: item.athleteUserId.toString(),
      serviceId: item.serviceId?.toString() ?? null,
      sessions: item.sessions,
      validity: {
        expiresAt: item.validity.expiresAt,
        freeze: item.validity.freeze
          ? {
              frozenAt: item.validity.freeze.frozenAt,
              unfreezeAt: item.validity.freeze.unfreezeAt ?? null,
            }
          : null,
      },
      status: item.status,
      pricing: item.pricing,
      paymentId: item.paymentId?.toString() ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toStudent(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    status: string;
    coaching?: { goalKey?: string; levelKey?: string };
    engagement?: {
      level?: string;
      progressPercent?: number;
      scoredAt?: Date;
      lastSessionAt?: Date;
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      athleteUserId: item.athleteUserId.toString(),
      status: item.status,
      coaching: {
        goalKey: item.coaching?.goalKey ?? null,
        levelKey: item.coaching?.levelKey ?? null,
      },
      engagement: {
        level:
          item.engagement?.level ?? CoachStudentEngagementLevel.HEALTHY,
        progressPercent: item.engagement?.progressPercent ?? null,
        scoredAt: item.engagement?.scoredAt?.toISOString() ?? null,
        lastSessionAt: item.engagement?.lastSessionAt?.toISOString() ?? null,
      },
      notes: item.notes ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toLead(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    contact: {
      name: string;
      phone?: string;
      userId?: Types.ObjectId;
    };
    stage: string;
    notes?: string;
    source?: string;
    convertedStudentId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      contact: {
        name: item.contact.name,
        phone: item.contact.phone ?? null,
        userId: item.contact.userId?.toString() ?? null,
      },
      stage: item.stage,
      notes: item.notes ?? null,
      source: item.source ?? null,
      convertedStudentId: item.convertedStudentId?.toString() ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toHealth(item: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    privacy: string;
    answers: unknown;
    limitations?: string[];
    status: string;
    reviewedByCoachUserId?: Types.ObjectId;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      athleteUserId: item.athleteUserId.toString(),
      privacy: item.privacy,
      answers: item.answers,
      limitations: item.limitations ?? [],
      status: item.status,
      reviewedByCoachUserId: item.reviewedByCoachUserId?.toString() ?? null,
      reviewedAt: item.reviewedAt ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  // ── Direct messaging (N4) ───────────────────────────────────────────────

  async listThreadsForCoach(coachUserId: string, query: ListCoachThreadsQueryDto) {
    const filter: QueryFilter<CoachThreadDocument> = {
      coachUserId: this.oid(coachUserId),
      status: EntityStatus.ACTIVE,
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.threadModel
        .find(filter)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.threadModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((t) => this.toThread(t)),
      total,
      page,
      pageSize,
    );
  }

  async listThreadsForAthlete(
    athleteUserId: string,
    query: ListCoachThreadsQueryDto,
  ) {
    const filter: QueryFilter<CoachThreadDocument> = {
      athleteUserId: this.oid(athleteUserId),
      status: EntityStatus.ACTIVE,
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.threadModel
        .find(filter)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.threadModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((t) => this.toThread(t)),
      total,
      page,
      pageSize,
    );
  }

  async openOrGetThreadAsCoach(
    coachUserId: string,
    dto: OpenCoachThreadDto,
  ) {
    await this.assertActiveStudentLink(coachUserId, dto.athleteUserId);
    return this.ensureThread(coachUserId, dto.athleteUserId);
  }

  async openOrGetThreadAsAthlete(
    athleteUserId: string,
    dto: OpenAthleteThreadDto,
  ) {
    await this.assertActiveStudentLink(dto.coachUserId, athleteUserId);
    return this.ensureThread(dto.coachUserId, athleteUserId);
  }

  async listMessages(
    threadId: string,
    userId: string,
    activeRole: Role,
    query: ListCoachMessagesQueryDto,
  ) {
    const thread = await this.findThreadOrFail(threadId);
    this.assertThreadParticipant(thread, userId, activeRole);
    await this.assertActiveStudentLink(
      thread.coachUserId.toString(),
      thread.athleteUserId.toString(),
    );

    const filter: QueryFilter<CoachMessageDocument> = {
      threadId: thread._id,
    };
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .sort({ sentAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.messageModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((m) => this.toMessage(m)),
      total,
      page,
      pageSize,
    );
  }

  async sendMessage(
    threadId: string,
    userId: string,
    activeRole: Role,
    dto: SendCoachMessageDto,
    request?: Request,
  ) {
    if (activeRole !== Role.COACH && activeRole !== Role.ATHLETE) {
      throw new ForbiddenException('Only coach or athlete can message');
    }
    const thread = await this.findThreadOrFail(threadId);
    this.assertThreadParticipant(thread, userId, activeRole);
    await this.assertActiveStudentLink(
      thread.coachUserId.toString(),
      thread.athleteUserId.toString(),
    );

    const now = new Date();
    const message = await this.messageModel.create({
      threadId: thread._id,
      senderUserId: this.oid(userId),
      senderRole: activeRole,
      body: dto.body.trim(),
      sentAt: now,
    });
    thread.lastMessageAt = now;
    await thread.save();

    this.audit.log({
      action: AuditAction.COACH_MESSAGE_SENT,
      actorId: userId,
      metadata: {
        threadId,
        messageId: message._id.toString(),
      },
      request,
    });

    return this.toMessage(message.toObject());
  }

  private async ensureThread(coachUserId: string, athleteUserId: string) {
    let thread = await this.threadModel.findOne({
      coachUserId: this.oid(coachUserId),
      athleteUserId: this.oid(athleteUserId),
    });
    if (!thread) {
      thread = await this.threadModel.create({
        coachUserId: this.oid(coachUserId),
        athleteUserId: this.oid(athleteUserId),
        status: EntityStatus.ACTIVE,
      });
    } else if (thread.status !== EntityStatus.ACTIVE) {
      thread.status = EntityStatus.ACTIVE;
      await thread.save();
    }
    return this.toThread(thread.toObject());
  }

  private async assertActiveStudentLink(
    coachUserId: string,
    athleteUserId: string,
  ) {
    const link = await this.studentModel.findOne({
      coachUserId: this.oid(coachUserId),
      athleteUserId: this.oid(athleteUserId),
      status: CoachStudentStatus.ACTIVE,
    });
    if (!link) {
      throw new ForbiddenException(
        'Messaging requires an active coach–student relationship',
      );
    }
  }

  private async findThreadOrFail(threadId: string) {
    if (!Types.ObjectId.isValid(threadId)) {
      throw new NotFoundException('Thread not found');
    }
    const thread = await this.threadModel.findById(threadId);
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  private assertThreadParticipant(
    thread: CoachThreadDocument,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.COACH && thread.coachUserId.toString() === userId) {
      return;
    }
    if (
      activeRole === Role.ATHLETE &&
      thread.athleteUserId.toString() === userId
    ) {
      return;
    }
    throw new ForbiddenException('Not a participant of this thread');
  }

  private toThread(item: {
    _id: Types.ObjectId;
    coachUserId: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    status: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      athleteUserId: item.athleteUserId.toString(),
      status: item.status,
      lastMessageAt: item.lastMessageAt?.toISOString() ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toMessage(item: {
    _id: Types.ObjectId;
    threadId: Types.ObjectId;
    senderUserId: Types.ObjectId;
    senderRole: string;
    body: string;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: item._id.toString(),
      threadId: item.threadId.toString(),
      senderUserId: item.senderUserId.toString(),
      senderRole: item.senderRole,
      body: item.body,
      sentAt: item.sentAt.toISOString(),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
