import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import {
  AchievementGrantMode,
  AchievementMetric,
  AnalyticsEventName,
  AuditAction,
  BookingStatus,
  ClubUserReviewStatus,
  EntityStatus,
  GamificationSubjectType,
  NotificationTemplateKey,
  PointRuleEvent,
  PointRuleRepeat,
  PointTransactionReason,
  Role,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { EventWriterService } from '../analytics/event-writer.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Achievement,
  AchievementDocument,
} from '../schemas/achievement.schema';
import {
  AchievementGrant,
  AchievementGrantDocument,
} from '../schemas/achievement-grant.schema';
import {
  ArticleUserState,
  ArticleUserStateDocument,
} from '../schemas/article-user-state.schema';
import {
  AthleteProfile,
  AthleteProfileDocument,
} from '../schemas/athlete-profile.schema';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import {
  ClubUserReview,
  ClubUserReviewDocument,
} from '../schemas/club-user-review.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../schemas/coach-profile.schema';
import { PointRule, PointRuleDocument } from '../schemas/point-rule.schema';
import {
  PointTransaction,
  PointTransactionDocument,
} from '../schemas/point-transaction.schema';
import {
  AdjustPointsDto,
  CreateAchievementDto,
  CreatePointRuleDto,
  GrantAchievementSubjectDto,
  ListAchievementsQueryDto,
  ListGrantsQueryDto,
  ListPointRulesQueryDto,
  ListTransactionsQueryDto,
  UpdateAchievementDto,
  UpdatePointRuleDto,
} from './dto/gamification.dto';

export interface GamificationSubjectRef {
  type: GamificationSubjectType;
  /** userId for athlete/coach, clubId for club. */
  id: string | Types.ObjectId;
}

export interface GamificationEventInput {
  event: PointRuleEvent;
  /** Unique per occurrence (bookingId, `${articleId}:${userId}`, …). */
  eventKey: string;
  occurredAt?: Date;
  subjects: GamificationSubjectRef[];
  /** Entity that triggered the event, used for once-per-target dedupe. */
  target?: { type: string; id: string | Types.ObjectId };
}

const SYSTEM_ACTOR = 'system';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectModel(Achievement.name)
    private readonly achievementModel: Model<AchievementDocument>,
    @InjectModel(AchievementGrant.name)
    private readonly grantModel: Model<AchievementGrantDocument>,
    @InjectModel(PointRule.name)
    private readonly ruleModel: Model<PointRuleDocument>,
    @InjectModel(PointTransaction.name)
    private readonly txModel: Model<PointTransactionDocument>,
    @InjectModel(AthleteProfile.name)
    private readonly athleteModel: Model<AthleteProfileDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(ArticleUserState.name)
    private readonly articleStateModel: Model<ArticleUserStateDocument>,
    @InjectModel(ClubUserReview.name)
    private readonly clubReviewModel: Model<ClubUserReviewDocument>,
    private readonly events: EventWriterService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ── Points engine ────────────────────────────────────────────────────────

  /**
   * Entry point for domain events. Never throws — gamification must not
   * break the business flow that triggered it.
   */
  async handleEvent(input: GamificationEventInput): Promise<void> {
    try {
      await this.processEvent(input);
    } catch (err) {
      this.logger.warn(
        `handleEvent(${input.event}) failed: ${(err as Error).message}`,
      );
    }
  }

  /** Convenience wrapper: resolve the acting user's subject, then handle. */
  async handleUserEvent(
    userId: string,
    activeRole: Role,
    input: Omit<GamificationEventInput, 'subjects'>,
  ): Promise<void> {
    try {
      const subject = await this.resolveSubject(userId, activeRole);
      if (!subject) return;
      await this.processEvent({ ...input, subjects: [subject] });
    } catch (err) {
      this.logger.warn(
        `handleUserEvent(${input.event}) failed: ${(err as Error).message}`,
      );
    }
  }

  private async processEvent(input: GamificationEventInput): Promise<void> {
    const occurredAt = input.occurredAt ?? new Date();
    const rules = await this.ruleModel
      .find({
        event: input.event,
        status: EntityStatus.ACTIVE,
        $and: [
          {
            $or: [
              { 'effective.from': { $exists: false } },
              { 'effective.from': null },
              { 'effective.from': { $lte: occurredAt } },
            ],
          },
          {
            $or: [
              { 'effective.to': { $exists: false } },
              { 'effective.to': null },
              { 'effective.to': { $gte: occurredAt } },
            ],
          },
        ],
      })
      .lean();

    const touched: GamificationSubjectRef[] = [];

    for (const rule of rules) {
      for (const award of rule.awards) {
        const subject = input.subjects.find(
          (s) => s.type === award.subjectType,
        );
        if (!subject) continue;

        const scopeKey = this.scopeKey(rule.limits?.repeat, input);
        const dedupeKey = `rule:${rule._id}:${subject.type}:${subject.id}:${scopeKey}`;

        if (rule.limits?.dailyCap) {
          const startOfDay = new Date(occurredAt);
          startOfDay.setHours(0, 0, 0, 0);
          const todayCount = await this.txModel.countDocuments({
            'source.ruleId': rule._id,
            'subject.type': subject.type,
            'subject.id': new Types.ObjectId(subject.id.toString()),
            occurredAt: { $gte: startOfDay },
          });
          if (todayCount >= rule.limits.dailyCap) continue;
        }

        const created = await this.writeTransaction({
          subject,
          amount: award.points,
          reason: PointTransactionReason.RULE_AWARD,
          dedupeKey,
          occurredAt,
          source: {
            ruleId: rule._id,
            targetType: input.target?.type,
            targetId: input.target
              ? new Types.ObjectId(input.target.id.toString())
              : undefined,
          },
        });

        if (created) {
          touched.push(subject);
          void this.events.track({
            eventName: AnalyticsEventName.POINTS_AWARDED,
            occurredAt,
            actor: this.actorForSubject(subject),
            properties: {
              ruleId: rule._id.toString(),
              event: input.event,
              subjectType: subject.type,
              subjectId: subject.id.toString(),
              points: award.points,
            },
          });
        }
      }
    }

    // Re-evaluate achievements for every subject involved in the event, even
    // if no rule matched (count-based metrics may have moved regardless).
    const seen = new Set<string>();
    for (const subject of [...touched, ...input.subjects]) {
      const key = `${subject.type}:${subject.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await this.evaluateAchievements(subject);
    }
  }

  private scopeKey(
    repeat: PointRuleRepeat | undefined,
    input: GamificationEventInput,
  ): string {
    switch (repeat) {
      case PointRuleRepeat.ONCE:
        return 'once';
      case PointRuleRepeat.ONCE_PER_TARGET:
        return input.target
          ? `${input.target.type}:${input.target.id}`
          : input.eventKey;
      default:
        return input.eventKey;
    }
  }

  private actorForSubject(subject: GamificationSubjectRef) {
    if (subject.type === GamificationSubjectType.CLUB) return {};
    return {
      userId: subject.id.toString(),
      activeRole:
        subject.type === GamificationSubjectType.ATHLETE
          ? Role.ATHLETE
          : Role.COACH,
    };
  }

  /** Append to the ledger; returns false when dedupeKey already exists. */
  private async writeTransaction(input: {
    subject: GamificationSubjectRef;
    amount: number;
    reason: PointTransactionReason;
    dedupeKey: string;
    occurredAt: Date;
    note?: string;
    source?: {
      ruleId?: Types.ObjectId;
      achievementId?: Types.ObjectId;
      targetType?: string;
      targetId?: Types.ObjectId;
      adminId?: Types.ObjectId;
    };
  }): Promise<boolean> {
    try {
      await this.txModel.create({
        subject: {
          type: input.subject.type,
          id: new Types.ObjectId(input.subject.id.toString()),
        },
        amount: input.amount,
        reason: input.reason,
        source: input.source ?? {},
        dedupeKey: input.dedupeKey,
        note: input.note,
        occurredAt: input.occurredAt,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return false;
      throw err;
    }
    await this.applyToCache(input.subject, input.amount);
    return true;
  }

  private async applyToCache(
    subject: GamificationSubjectRef,
    amount: number,
  ): Promise<void> {
    const inc = {
      'points.balance': amount,
      'points.lifetime': Math.max(amount, 0),
    };
    const id = new Types.ObjectId(subject.id.toString());
    if (subject.type === GamificationSubjectType.ATHLETE) {
      await this.athleteModel.updateOne({ userId: id }, { $inc: inc });
    } else if (subject.type === GamificationSubjectType.COACH) {
      await this.coachModel.updateOne({ userId: id }, { $inc: inc });
    } else {
      await this.clubModel.updateOne({ _id: id }, { $inc: inc });
    }
  }

  private async readPoints(
    subject: GamificationSubjectRef,
  ): Promise<{ balance: number; lifetime: number }> {
    const id = new Types.ObjectId(subject.id.toString());
    let doc: { points?: { balance: number; lifetime: number } } | null = null;
    if (subject.type === GamificationSubjectType.ATHLETE) {
      doc = await this.athleteModel
        .findOne({ userId: id })
        .select({ points: 1 })
        .lean();
    } else if (subject.type === GamificationSubjectType.COACH) {
      doc = await this.coachModel
        .findOne({ userId: id })
        .select({ points: 1 })
        .lean();
    } else {
      doc = await this.clubModel.findById(id).select({ points: 1 }).lean();
    }
    return doc?.points ?? { balance: 0, lifetime: 0 };
  }

  // ── Achievement engine ───────────────────────────────────────────────────

  /** Check all automatic achievements for the subject and grant any earned. */
  async evaluateAchievements(subject: GamificationSubjectRef): Promise<void> {
    const achievements = await this.achievementModel
      .find({
        status: EntityStatus.ACTIVE,
        audience: subject.type,
        'grant.mode': AchievementGrantMode.AUTOMATIC,
      })
      .lean();
    if (achievements.length === 0) return;

    const subjectId = new Types.ObjectId(subject.id.toString());
    const granted = await this.grantModel
      .find({
        'subject.type': subject.type,
        'subject.id': subjectId,
        revokedAt: { $exists: false },
      })
      .select({ achievementId: 1 })
      .lean();
    const grantedIds = new Set(granted.map((g) => g.achievementId.toString()));

    const metricCache = new Map<string, number>();
    for (const achievement of achievements) {
      if (grantedIds.has(achievement._id.toString())) continue;
      const rule = achievement.grant.rule;
      if (!rule) continue;

      let current = metricCache.get(rule.metric);
      if (current === undefined) {
        current = await this.computeMetric(subject, rule.metric);
        metricCache.set(rule.metric, current);
      }
      if (current >= rule.threshold) {
        await this.grantToSubject(achievement._id, subject, SYSTEM_ACTOR);
      }
    }
  }

  async computeMetric(
    subject: GamificationSubjectRef,
    metric: AchievementMetric,
  ): Promise<number> {
    const id = new Types.ObjectId(subject.id.toString());
    switch (metric) {
      case AchievementMetric.LIFETIME_POINTS:
        return (await this.readPoints(subject)).lifetime;
      case AchievementMetric.BOOKINGS_COUNT: {
        if (subject.type === GamificationSubjectType.ATHLETE) {
          return this.bookingModel.countDocuments({
            athleteUserId: id,
            status: BookingStatus.COMPLETED,
          });
        }
        if (subject.type === GamificationSubjectType.COACH) {
          return this.bookingModel.countDocuments({
            coachUserId: id,
            status: BookingStatus.COMPLETED,
          });
        }
        return this.bookingModel.countDocuments({
          clubId: id,
          status: BookingStatus.COMPLETED,
        });
      }
      case AchievementMetric.ARTICLES_READ_COUNT:
        if (subject.type === GamificationSubjectType.CLUB) return 0;
        return this.articleStateModel.countDocuments({
          userId: id,
          readAt: { $exists: true },
        });
      case AchievementMetric.ARTICLES_LIKED_COUNT:
        if (subject.type === GamificationSubjectType.CLUB) return 0;
        return this.articleStateModel.countDocuments({
          userId: id,
          likedAt: { $exists: true },
        });
      case AchievementMetric.REVIEWS_COUNT:
        if (subject.type !== GamificationSubjectType.CLUB) return 0;
        return this.clubReviewModel.countDocuments({
          clubId: id,
          status: ClubUserReviewStatus.APPROVED,
        });
      case AchievementMetric.REVIEWS_AVERAGE: {
        if (subject.type !== GamificationSubjectType.CLUB) return 0;
        const club = await this.clubModel
          .findById(id)
          .select({ reviewsSummary: 1 })
          .lean();
        return club?.reviewsSummary?.average ?? 0;
      }
      case AchievementMetric.BRANCHES_COUNT:
        if (subject.type !== GamificationSubjectType.CLUB) return 0;
        return this.clubModel.countDocuments({ parentClubId: id });
      default:
        return 0;
    }
  }

  /** Grant an achievement; idempotent per (achievement, subject). */
  private async grantToSubject(
    achievementId: Types.ObjectId,
    subject: GamificationSubjectRef,
    grantedBy: string,
  ): Promise<boolean> {
    const achievement = await this.achievementModel
      .findById(achievementId)
      .lean();
    if (!achievement) return false;

    const subjectId = new Types.ObjectId(subject.id.toString());
    const now = new Date();
    try {
      await this.grantModel.create({
        achievementId,
        subject: { type: subject.type, id: subjectId },
        grantedAt: now,
        grantedBy,
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) return false;
      throw err;
    }

    if (achievement.bonusPoints > 0) {
      await this.writeTransaction({
        subject,
        amount: achievement.bonusPoints,
        reason: PointTransactionReason.ACHIEVEMENT_BONUS,
        dedupeKey: `achv:${achievementId}:${subject.type}:${subject.id}`,
        occurredAt: now,
        source: { achievementId },
      });
    }

    // Keep the club's embedded achievements list (used by discovery) in sync.
    if (subject.type === GamificationSubjectType.CLUB) {
      await this.clubModel.updateOne(
        { _id: subjectId, 'achievements.achievementId': { $ne: achievementId } },
        {
          $push: {
            achievements: { achievementId, grantedAt: now, grantedBy },
          },
        },
      );
    }

    void this.events.track({
      eventName: AnalyticsEventName.ACHIEVEMENT_UNLOCKED,
      occurredAt: now,
      actor: this.actorForSubject(subject),
      properties: {
        achievementId: achievementId.toString(),
        subjectType: subject.type,
        subjectId: subject.id.toString(),
        grantedBy,
      },
    });

    const notifyUserId = await this.userIdForSubject(subject);
    if (notifyUserId) {
      void this.notifications.dispatch({
        userId: notifyUserId,
        templateKey: NotificationTemplateKey.ACHIEVEMENT_UNLOCKED,
        params: {
          achievementTitle: achievement.title,
          bonusSuffix:
            achievement.bonusPoints > 0
              ? ` و ${achievement.bonusPoints} امتیاز جایزه گرفتید`
              : '',
        },
        payload: { achievementId: achievementId.toString() },
        idempotencyKey: `achv:${achievementId}:${subject.type}:${subject.id}`,
      });
    }
    return true;
  }

  private async userIdForSubject(
    subject: GamificationSubjectRef,
  ): Promise<string | null> {
    if (subject.type !== GamificationSubjectType.CLUB) {
      return subject.id.toString();
    }
    const club = await this.clubModel
      .findById(subject.id)
      .select({ ownerId: 1 })
      .lean();
    return club?.ownerId?.toString() ?? null;
  }

  // ── Account (self) surface ───────────────────────────────────────────────

  /** Map the JWT activeRole onto a gamification subject. */
  async resolveSubject(
    userId: string,
    activeRole: Role,
  ): Promise<GamificationSubjectRef | null> {
    if (activeRole === Role.ATHLETE) {
      return { type: GamificationSubjectType.ATHLETE, id: userId };
    }
    if (activeRole === Role.COACH) {
      return { type: GamificationSubjectType.COACH, id: userId };
    }
    if (activeRole === Role.CLUB_OWNER) {
      const club = await this.clubModel
        .findOne({ ownerId: new Types.ObjectId(userId), parentClubId: null })
        .select({ _id: 1 })
        .lean();
      if (!club) {
        const anyClub = await this.clubModel
          .findOne({ ownerId: new Types.ObjectId(userId) })
          .select({ _id: 1 })
          .lean();
        if (!anyClub) return null;
        return { type: GamificationSubjectType.CLUB, id: anyClub._id };
      }
      return { type: GamificationSubjectType.CLUB, id: club._id };
    }
    return null;
  }

  async getSummary(userId: string, activeRole: Role) {
    const subject = await this.resolveSubject(userId, activeRole);
    if (!subject) {
      return {
        subjectType: null,
        points: { balance: 0, lifetime: 0 },
        achievements: { unlocked: 0, total: 0 },
      };
    }
    const [points, unlocked, total] = await Promise.all([
      this.readPoints(subject),
      this.grantModel.countDocuments({
        'subject.type': subject.type,
        'subject.id': new Types.ObjectId(subject.id.toString()),
        revokedAt: { $exists: false },
      }),
      this.achievementModel.countDocuments({
        status: EntityStatus.ACTIVE,
        audience: subject.type,
      }),
    ]);
    return {
      subjectType: subject.type,
      points,
      achievements: { unlocked, total },
    };
  }

  /** Full badge grid: every active achievement with unlocked/locked state. */
  async listMyAchievements(userId: string, activeRole: Role) {
    const subject = await this.resolveSubject(userId, activeRole);
    if (!subject) return [];

    const subjectId = new Types.ObjectId(subject.id.toString());
    const [achievements, grants] = await Promise.all([
      this.achievementModel
        .find({ status: EntityStatus.ACTIVE, audience: subject.type })
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      this.grantModel
        .find({
          'subject.type': subject.type,
          'subject.id': subjectId,
          revokedAt: { $exists: false },
        })
        .lean(),
    ]);
    const grantByAchievement = new Map(
      grants.map((g) => [g.achievementId.toString(), g]),
    );

    const metricCache = new Map<string, number>();
    const result: Array<{
      id: string;
      title: string;
      description: string | null;
      icon: string | null;
      badgeMediaId: string | null;
      bonusPoints: number;
      state: 'unlocked' | 'locked';
      grantedAt: string | null;
      progress: { current: number; threshold: number } | null;
    }> = [];
    for (const achievement of achievements) {
      const grant = grantByAchievement.get(achievement._id.toString());
      let progress: { current: number; threshold: number } | null = null;
      const rule = achievement.grant.rule;
      if (!grant && achievement.grant.mode === AchievementGrantMode.AUTOMATIC && rule) {
        let current = metricCache.get(rule.metric);
        if (current === undefined) {
          current = await this.computeMetric(subject, rule.metric);
          metricCache.set(rule.metric, current);
        }
        progress = { current, threshold: rule.threshold };
      }
      result.push({
        id: achievement._id.toString(),
        title: achievement.title,
        description: achievement.description ?? null,
        icon: achievement.icon ?? null,
        badgeMediaId: achievement.badgeMediaId?.toString() ?? null,
        bonusPoints: achievement.bonusPoints,
        state: grant ? ('unlocked' as const) : ('locked' as const),
        grantedAt: grant?.grantedAt?.toISOString() ?? null,
        progress,
      });
    }
    return result;
  }

  async listMyTransactions(
    userId: string,
    activeRole: Role,
    query: ListTransactionsQueryDto,
  ) {
    const subject = await this.resolveSubject(userId, activeRole);
    const { page, pageSize } = resolvePageSize(query);
    if (!subject) return paginatedResult([], 0, page, pageSize);

    const filter = {
      'subject.type': subject.type,
      'subject.id': new Types.ObjectId(subject.id.toString()),
    };
    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.txModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((t) => this.toTransactionPublic(t)),
      total,
      page,
      pageSize,
    );
  }

  /** Public achievements + points for a subject (discovery profiles). */
  async listPublicAchievements(subject: GamificationSubjectRef) {
    const subjectId = new Types.ObjectId(subject.id.toString());
    const grants = await this.grantModel
      .find({
        'subject.type': subject.type,
        'subject.id': subjectId,
        revokedAt: { $exists: false },
      })
      .sort({ grantedAt: -1 })
      .lean();
    if (grants.length === 0) {
      return { points: await this.readPoints(subject), achievements: [] };
    }
    const achievements = await this.achievementModel
      .find({
        _id: { $in: grants.map((g) => g.achievementId) },
        status: EntityStatus.ACTIVE,
      })
      .lean();
    const byId = new Map(achievements.map((a) => [a._id.toString(), a]));
    return {
      points: await this.readPoints(subject),
      achievements: grants
        .map((g) => {
          const achievement = byId.get(g.achievementId.toString());
          if (!achievement) return null;
          return {
            id: achievement._id.toString(),
            title: achievement.title,
            description: achievement.description ?? null,
            icon: achievement.icon ?? null,
            badgeMediaId: achievement.badgeMediaId?.toString() ?? null,
            grantedAt: g.grantedAt.toISOString(),
          };
        })
        .filter((a): a is NonNullable<typeof a> => a !== null),
    };
  }

  // ── Admin: achievements CRUD ─────────────────────────────────────────────

  async adminListAchievements(query: ListAchievementsQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.audience) filter.audience = query.audience;
    const [items, total] = await Promise.all([
      this.achievementModel
        .find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.achievementModel.countDocuments(filter),
    ]);
    const counts = await this.grantModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          achievementId: { $in: items.map((a) => a._id) },
          revokedAt: { $exists: false },
        },
      },
      { $group: { _id: '$achievementId', count: { $sum: 1 } } },
    ]);
    const countById = new Map(counts.map((c) => [c._id.toString(), c.count]));
    return paginatedResult(
      items.map((a) => ({
        ...this.toAchievementPublic(a),
        grantsCount: countById.get(a._id.toString()) ?? 0,
      })),
      total,
      page,
      pageSize,
    );
  }

  async adminGetAchievement(id: string) {
    const achievement = await this.achievementModel.findById(id).lean();
    if (!achievement) throw new NotFoundException('Achievement not found');
    return this.toAchievementPublic(achievement);
  }

  async adminCreateAchievement(
    dto: CreateAchievementDto,
    adminId: string,
    request: Request,
  ) {
    this.assertGrantConfig(dto.grant);
    const achievement = await this.achievementModel.create({
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      badgeMediaId: dto.badgeMediaId
        ? new Types.ObjectId(dto.badgeMediaId)
        : undefined,
      audience: dto.audience,
      bonusPoints: dto.bonusPoints ?? 0,
      grant: dto.grant,
      status: dto.status ?? EntityStatus.ACTIVE,
      order: dto.order ?? 0,
    });
    this.audit.log({
      action: AuditAction.GAMIFICATION_ACHIEVEMENT_CREATED,
      actorId: adminId,
      metadata: { achievementId: achievement._id.toString() },
      request,
    });
    return this.toAchievementPublic(achievement.toObject());
  }

  async adminUpdateAchievement(
    id: string,
    dto: UpdateAchievementDto,
    adminId: string,
    request: Request,
  ) {
    const achievement = await this.achievementModel.findById(id);
    if (!achievement) throw new NotFoundException('Achievement not found');
    if (dto.grant) {
      this.assertGrantConfig(dto.grant);
      achievement.grant = dto.grant as typeof achievement.grant;
    }
    if (dto.title !== undefined) achievement.title = dto.title;
    if (dto.description !== undefined) achievement.description = dto.description;
    if (dto.icon !== undefined) achievement.icon = dto.icon;
    if (dto.badgeMediaId !== undefined) {
      achievement.badgeMediaId = new Types.ObjectId(dto.badgeMediaId);
    }
    if (dto.audience !== undefined) achievement.audience = dto.audience;
    if (dto.bonusPoints !== undefined) achievement.bonusPoints = dto.bonusPoints;
    if (dto.status !== undefined) achievement.status = dto.status;
    if (dto.order !== undefined) achievement.order = dto.order;
    await achievement.save();
    this.audit.log({
      action: AuditAction.GAMIFICATION_ACHIEVEMENT_UPDATED,
      actorId: adminId,
      metadata: { achievementId: id },
      request,
    });
    return this.toAchievementPublic(achievement.toObject());
  }

  /** Soft delete: archive so historical grants keep resolving. */
  async adminArchiveAchievement(id: string, adminId: string, request: Request) {
    const achievement = await this.achievementModel.findById(id);
    if (!achievement) throw new NotFoundException('Achievement not found');
    achievement.status = EntityStatus.ARCHIVED;
    await achievement.save();
    this.audit.log({
      action: AuditAction.GAMIFICATION_ACHIEVEMENT_DELETED,
      actorId: adminId,
      metadata: { achievementId: id },
      request,
    });
    return { archived: true };
  }

  private assertGrantConfig(grant: {
    mode: AchievementGrantMode;
    rule?: { metric: AchievementMetric; threshold: number };
  }) {
    if (grant.mode === AchievementGrantMode.AUTOMATIC && !grant.rule) {
      throw new BadRequestException(
        'Automatic achievements require a grant rule (metric + threshold)',
      );
    }
  }

  // ── Admin: manual grant / revoke ─────────────────────────────────────────

  async adminGrantAchievement(
    achievementId: string,
    dto: GrantAchievementSubjectDto,
    adminId: string,
    request: Request,
  ) {
    const achievement = await this.achievementModel
      .findById(achievementId)
      .lean();
    if (!achievement || achievement.status !== EntityStatus.ACTIVE) {
      throw new NotFoundException('Achievement not found');
    }
    if (!achievement.audience.includes(dto.subjectType)) {
      throw new BadRequestException(
        `Achievement audience does not include ${dto.subjectType}`,
      );
    }
    await this.assertSubjectExists(dto.subjectType, dto.subjectId);
    const granted = await this.grantToSubject(
      new Types.ObjectId(achievementId),
      { type: dto.subjectType, id: dto.subjectId },
      adminId,
    );
    this.audit.log({
      action: AuditAction.GAMIFICATION_ACHIEVEMENT_GRANTED,
      actorId: adminId,
      metadata: {
        achievementId,
        subjectType: dto.subjectType,
        subjectId: dto.subjectId,
        deduplicated: !granted,
      },
      request,
    });
    return { granted };
  }

  async adminRevokeAchievement(
    achievementId: string,
    dto: GrantAchievementSubjectDto,
    adminId: string,
    request: Request,
  ) {
    const grant = await this.grantModel.findOne({
      achievementId: new Types.ObjectId(achievementId),
      'subject.type': dto.subjectType,
      'subject.id': new Types.ObjectId(dto.subjectId),
      revokedAt: { $exists: false },
    });
    if (!grant) throw new NotFoundException('Grant not found');
    grant.revokedAt = new Date();
    grant.revokedBy = adminId;
    await grant.save();

    if (dto.subjectType === GamificationSubjectType.CLUB) {
      await this.clubModel.updateOne(
        { _id: new Types.ObjectId(dto.subjectId) },
        {
          $pull: {
            achievements: {
              achievementId: new Types.ObjectId(achievementId),
            },
          },
        },
      );
    }
    this.audit.log({
      action: AuditAction.GAMIFICATION_ACHIEVEMENT_REVOKED,
      actorId: adminId,
      metadata: {
        achievementId,
        subjectType: dto.subjectType,
        subjectId: dto.subjectId,
      },
      request,
    });
    return { revoked: true };
  }

  async adminListGrants(query: ListGrantsQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: Record<string, unknown> = { revokedAt: { $exists: false } };
    if (query.subjectType) filter['subject.type'] = query.subjectType;
    if (query.subjectId) {
      filter['subject.id'] = new Types.ObjectId(query.subjectId);
    }
    if (query.achievementId) {
      filter.achievementId = new Types.ObjectId(query.achievementId);
    }
    const [items, total] = await Promise.all([
      this.grantModel
        .find(filter)
        .sort({ grantedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.grantModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((g) => ({
        id: g._id.toString(),
        achievementId: g.achievementId.toString(),
        subject: { type: g.subject.type, id: g.subject.id.toString() },
        grantedAt: g.grantedAt.toISOString(),
        grantedBy: g.grantedBy,
      })),
      total,
      page,
      pageSize,
    );
  }

  private async assertSubjectExists(
    type: GamificationSubjectType,
    id: string,
  ): Promise<void> {
    const objectId = new Types.ObjectId(id);
    const exists =
      type === GamificationSubjectType.CLUB
        ? await this.clubModel.exists({ _id: objectId })
        : type === GamificationSubjectType.ATHLETE
          ? await this.athleteModel.exists({ userId: objectId })
          : await this.coachModel.exists({ userId: objectId });
    if (!exists) {
      throw new NotFoundException(`${type} subject not found`);
    }
  }

  // ── Admin: point rules CRUD ──────────────────────────────────────────────

  async adminListPointRules(query: ListPointRulesQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.event) filter.event = query.event;
    const [items, total] = await Promise.all([
      this.ruleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.ruleModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((r) => this.toRulePublic(r)),
      total,
      page,
      pageSize,
    );
  }

  async adminGetPointRule(id: string) {
    const rule = await this.ruleModel.findById(id).lean();
    if (!rule) throw new NotFoundException('Point rule not found');
    return this.toRulePublic(rule);
  }

  async adminCreatePointRule(
    dto: CreatePointRuleDto,
    adminId: string,
    request: Request,
  ) {
    const rule = await this.ruleModel.create({
      title: dto.title,
      description: dto.description,
      event: dto.event,
      awards: dto.awards,
      limits: dto.limits ?? {},
      effective: {
        from: dto.effective?.from ? new Date(dto.effective.from) : undefined,
        to: dto.effective?.to ? new Date(dto.effective.to) : undefined,
      },
      status: dto.status ?? EntityStatus.ACTIVE,
    });
    this.audit.log({
      action: AuditAction.GAMIFICATION_POINT_RULE_CREATED,
      actorId: adminId,
      metadata: { ruleId: rule._id.toString(), event: dto.event },
      request,
    });
    return this.toRulePublic(rule.toObject());
  }

  async adminUpdatePointRule(
    id: string,
    dto: UpdatePointRuleDto,
    adminId: string,
    request: Request,
  ) {
    const rule = await this.ruleModel.findById(id);
    if (!rule) throw new NotFoundException('Point rule not found');
    if (dto.title !== undefined) rule.title = dto.title;
    if (dto.description !== undefined) rule.description = dto.description;
    if (dto.event !== undefined) rule.event = dto.event;
    if (dto.awards !== undefined) {
      rule.awards = dto.awards as typeof rule.awards;
    }
    if (dto.limits !== undefined) {
      rule.limits = { ...rule.limits, ...dto.limits } as typeof rule.limits;
    }
    if (dto.effective !== undefined) {
      rule.effective = {
        from: dto.effective.from ? new Date(dto.effective.from) : undefined,
        to: dto.effective.to ? new Date(dto.effective.to) : undefined,
      } as typeof rule.effective;
    }
    if (dto.status !== undefined) rule.status = dto.status;
    await rule.save();
    this.audit.log({
      action: AuditAction.GAMIFICATION_POINT_RULE_UPDATED,
      actorId: adminId,
      metadata: { ruleId: id },
      request,
    });
    return this.toRulePublic(rule.toObject());
  }

  async adminArchivePointRule(id: string, adminId: string, request: Request) {
    const rule = await this.ruleModel.findById(id);
    if (!rule) throw new NotFoundException('Point rule not found');
    rule.status = EntityStatus.ARCHIVED;
    await rule.save();
    this.audit.log({
      action: AuditAction.GAMIFICATION_POINT_RULE_DELETED,
      actorId: adminId,
      metadata: { ruleId: id },
      request,
    });
    return { archived: true };
  }

  // ── Admin: ledger, adjustments, analytics ────────────────────────────────

  async adminListTransactions(query: ListTransactionsQueryDto) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: Record<string, unknown> = {};
    if (query.subjectType) filter['subject.type'] = query.subjectType;
    if (query.subjectId) {
      filter['subject.id'] = new Types.ObjectId(query.subjectId);
    }
    if (query.reason) filter.reason = query.reason;
    if (query.ruleId) filter['source.ruleId'] = new Types.ObjectId(query.ruleId);
    const [items, total] = await Promise.all([
      this.txModel
        .find(filter)
        .sort({ occurredAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.txModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((t) => this.toTransactionPublic(t)),
      total,
      page,
      pageSize,
    );
  }

  async adminAdjustPoints(
    dto: AdjustPointsDto,
    adminId: string,
    request: Request,
  ) {
    if (dto.amount === 0) {
      throw new BadRequestException('Amount must be non-zero');
    }
    await this.assertSubjectExists(dto.subjectType, dto.subjectId);
    const subject: GamificationSubjectRef = {
      type: dto.subjectType,
      id: dto.subjectId,
    };
    const now = new Date();
    await this.writeTransaction({
      subject,
      amount: dto.amount,
      reason: PointTransactionReason.ADMIN_ADJUSTMENT,
      dedupeKey: `adj:${adminId}:${dto.subjectType}:${dto.subjectId}:${now.getTime()}`,
      occurredAt: now,
      note: dto.note,
      source: { adminId: new Types.ObjectId(adminId) },
    });
    this.audit.log({
      action: AuditAction.GAMIFICATION_POINTS_ADJUSTED,
      actorId: adminId,
      metadata: {
        subjectType: dto.subjectType,
        subjectId: dto.subjectId,
        amount: dto.amount,
        note: dto.note,
      },
      request,
    });
    if (dto.amount > 0) {
      await this.evaluateAchievements(subject);
    }
    return { points: await this.readPoints(subject) };
  }

  /** Aggregated ledger stats — the analytics surface for the admin panel. */
  async adminOverview() {
    const [totals, byReason, byRule, topSubjects] = await Promise.all([
      this.txModel.aggregate<{
        _id: null;
        earned: number;
        spent: number;
        count: number;
      }>([
        {
          $group: {
            _id: null,
            earned: {
              $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] },
            },
            spent: {
              $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      this.txModel.aggregate<{ _id: string; total: number; count: number }>([
        {
          $group: {
            _id: '$reason',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.txModel.aggregate<{
        _id: Types.ObjectId;
        total: number;
        count: number;
      }>([
        { $match: { 'source.ruleId': { $exists: true } } },
        {
          $group: {
            _id: '$source.ruleId',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      this.txModel.aggregate<{
        _id: { type: string; id: Types.ObjectId };
        total: number;
      }>([
        { $match: { amount: { $gt: 0 } } },
        {
          $group: {
            _id: { type: '$subject.type', id: '$subject.id' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const ruleIds = byRule.map((r) => r._id);
    const rules = await this.ruleModel
      .find({ _id: { $in: ruleIds } })
      .select({ title: 1, event: 1 })
      .lean();
    const ruleById = new Map(rules.map((r) => [r._id.toString(), r]));

    const grantsCount = await this.grantModel.countDocuments({
      revokedAt: { $exists: false },
    });

    return {
      totals: {
        earned: totals[0]?.earned ?? 0,
        spent: Math.abs(totals[0]?.spent ?? 0),
        transactions: totals[0]?.count ?? 0,
        grants: grantsCount,
      },
      byReason: byReason.map((r) => ({
        reason: r._id,
        total: r.total,
        count: r.count,
      })),
      byRule: byRule.map((r) => {
        const rule = ruleById.get(r._id.toString());
        return {
          ruleId: r._id.toString(),
          title: rule?.title ?? null,
          event: rule?.event ?? null,
          total: r.total,
          count: r.count,
        };
      }),
      topSubjects: topSubjects.map((s) => ({
        subjectType: s._id.type,
        subjectId: s._id.id.toString(),
        total: s.total,
      })),
    };
  }

  // ── Mappers ──────────────────────────────────────────────────────────────

  private toAchievementPublic(a: {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    icon?: string;
    badgeMediaId?: Types.ObjectId;
    audience: GamificationSubjectType[];
    bonusPoints: number;
    grant: {
      mode: AchievementGrantMode;
      rule?: { metric: AchievementMetric; threshold: number };
    };
    status: EntityStatus;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: a._id.toString(),
      title: a.title,
      description: a.description ?? null,
      icon: a.icon ?? null,
      badgeMediaId: a.badgeMediaId?.toString() ?? null,
      audience: a.audience,
      bonusPoints: a.bonusPoints,
      grant: {
        mode: a.grant.mode,
        rule: a.grant.rule
          ? { metric: a.grant.rule.metric, threshold: a.grant.rule.threshold }
          : null,
      },
      status: a.status,
      order: a.order,
      createdAt: a.createdAt?.toISOString?.() ?? null,
      updatedAt: a.updatedAt?.toISOString?.() ?? null,
    };
  }

  private toRulePublic(r: {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    event: PointRuleEvent;
    awards: { subjectType: GamificationSubjectType; points: number }[];
    limits?: { repeat?: PointRuleRepeat; dailyCap?: number };
    effective?: { from?: Date; to?: Date };
    status: EntityStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: r._id.toString(),
      title: r.title,
      description: r.description ?? null,
      event: r.event,
      awards: r.awards.map((a) => ({
        subjectType: a.subjectType,
        points: a.points,
      })),
      limits: {
        repeat: r.limits?.repeat ?? PointRuleRepeat.UNLIMITED,
        dailyCap: r.limits?.dailyCap ?? null,
      },
      effective: {
        from: r.effective?.from?.toISOString() ?? null,
        to: r.effective?.to?.toISOString() ?? null,
      },
      status: r.status,
      createdAt: r.createdAt?.toISOString?.() ?? null,
      updatedAt: r.updatedAt?.toISOString?.() ?? null,
    };
  }

  private toTransactionPublic(t: {
    _id: Types.ObjectId;
    subject: { type: GamificationSubjectType; id: Types.ObjectId };
    amount: number;
    reason: PointTransactionReason;
    source?: {
      ruleId?: Types.ObjectId;
      achievementId?: Types.ObjectId;
      targetType?: string;
      targetId?: Types.ObjectId;
    };
    note?: string;
    occurredAt: Date;
  }) {
    return {
      id: t._id.toString(),
      subject: { type: t.subject.type, id: t.subject.id.toString() },
      amount: t.amount,
      reason: t.reason,
      source: {
        ruleId: t.source?.ruleId?.toString() ?? null,
        achievementId: t.source?.achievementId?.toString() ?? null,
        targetType: t.source?.targetType ?? null,
        targetId: t.source?.targetId?.toString() ?? null,
      },
      note: t.note ?? null,
      occurredAt: t.occurredAt.toISOString(),
    };
  }
}
