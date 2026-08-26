import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'node:crypto';
import { Model, Types, type ClientSession } from 'mongoose';
import { MongoTransactionService } from '../common/mongo/mongo-transaction.service';
import { paginatedResult } from '../common/utils/pagination.util';
import { OutboxService } from '../outbox/outbox.service';
import { CheckIn, CheckInDocument } from '../schemas/check-in.schema';
import {
  ClubBroadcast,
  ClubBroadcastAudience,
  ClubBroadcastDocument,
  ClubBroadcastStatus,
} from '../schemas/club-broadcast.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../schemas/club-membership.schema';
import {
  LifecycleJourney,
  LifecycleJourneyDocument,
  LifecycleJourneyStatus,
  LifecycleSegment,
  LifecycleSegmentDocument,
  LifecycleSegmentKind,
} from '../schemas/lifecycle.schema';
import { MembershipStatus, NotificationTemplateKey } from '../common/enums';
import {
  CreateClubBroadcastDto,
  ListClubBroadcastsQueryDto,
} from './dto/broadcast.dto';

const DAY_MS = 86_400_000;
/** Days between journey reminder steps. */
const STEP_INTERVAL_DAYS = 3;
/** A journey sends this many reminders, then completes. */
const MAX_JOURNEY_STEPS = 3;

type MembershipLean = {
  _id: Types.ObjectId;
  clubId: Types.ObjectId;
  holder?: { userId?: Types.ObjectId };
  credit?: {
    remainingSessions?: number;
    remainingEntries?: number;
    expiresAt?: Date;
  };
  status: string;
  createdAt?: Date;
};

/**
 * Rule-based retention segments + journeys (R5–R7).
 * Owners list at-risk members; the worker enrolls matching members into
 * journeys and advances due steps, delivering reminders through the outbox.
 */
@Injectable()
export class LifecycleService {
  private readonly logger = new Logger(LifecycleService.name);

  constructor(
    @InjectModel(LifecycleSegment.name)
    private readonly segmentModel: Model<LifecycleSegmentDocument>,
    @InjectModel(LifecycleJourney.name)
    private readonly journeyModel: Model<LifecycleJourneyDocument>,
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(CheckIn.name)
    private readonly checkInModel: Model<CheckInDocument>,
    @InjectModel(ClubBroadcast.name)
    private readonly broadcastModel: Model<ClubBroadcastDocument>,
    private readonly outbox: OutboxService,
    private readonly transactions: MongoTransactionService,
  ) {}

  async ensureDefaultSegments(clubId: string) {
    const defaults: Array<{
      kind: LifecycleSegmentKind;
      name: string;
      rule: Record<string, unknown>;
    }> = [
      {
        kind: LifecycleSegmentKind.EXPIRING_SOON,
        name: 'انقضای حداکثر ۷ روز',
        rule: { daysToExpiry: 7 },
      },
      {
        kind: LifecycleSegmentKind.LOW_CREDITS,
        name: 'حداکثر ۳ جلسه باقی‌مانده',
        rule: { remainingSessions: 3 },
      },
      {
        kind: LifecycleSegmentKind.NO_VISIT,
        name: 'بدون حضور ۱۴ روز',
        rule: { daysSinceCheckIn: 14 },
      },
    ];

    for (const item of defaults) {
      await this.segmentModel.updateOne(
        { clubId: new Types.ObjectId(clubId), kind: item.kind },
        {
          $setOnInsert: {
            clubId: new Types.ObjectId(clubId),
            kind: item.kind,
            name: item.name,
            rule: item.rule,
            status: 'active',
          },
        },
        { upsert: true },
      );
    }
  }

  async listSegments(clubId: string) {
    await this.ensureDefaultSegments(clubId);
    const items = await this.segmentModel
      .find({ clubId: new Types.ObjectId(clubId) })
      .lean();
    return {
      result: items.map((s) => ({
        id: s._id.toString(),
        clubId: s.clubId.toString(),
        kind: s.kind,
        name: s.name,
        rule: s.rule,
        status: s.status,
      })),
    };
  }

  async listAtRiskMembers(clubId: string) {
    await this.ensureDefaultSegments(clubId);
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [expiring, lowCredits] = await Promise.all([
      this.membershipModel
        .find({
          clubId: new Types.ObjectId(clubId),
          status: MembershipStatus.ACTIVE,
          'credit.expiresAt': { $gte: now, $lte: in7 },
        })
        .limit(100)
        .lean(),
      this.membershipModel
        .find({
          clubId: new Types.ObjectId(clubId),
          status: MembershipStatus.ACTIVE,
          'credit.remainingSessions': { $lte: 3, $gte: 0 },
        })
        .limit(100)
        .lean(),
    ]);

    return {
      expiringSoon: expiring.map((m) => this.memberRow(m)),
      lowCredits: lowCredits.map((m) => this.memberRow(m)),
    };
  }

  async enrollExpiringJourneys(clubId: string) {
    const { expiringSoon } = await this.listAtRiskMembers(clubId);
    let enrolled = 0;
    for (const row of expiringSoon) {
      if (!row.userId) continue;
      try {
        await this.journeyModel.updateOne(
          {
            clubId: new Types.ObjectId(clubId),
            userId: new Types.ObjectId(row.userId),
            segmentKind: LifecycleSegmentKind.EXPIRING_SOON,
            status: LifecycleJourneyStatus.ACTIVE,
          },
          {
            $setOnInsert: {
              clubId: new Types.ObjectId(clubId),
              userId: new Types.ObjectId(row.userId),
              segmentKind: LifecycleSegmentKind.EXPIRING_SOON,
              status: LifecycleJourneyStatus.ACTIVE,
              step: 0,
              nextActionAt: new Date(),
              context: { membershipId: row.id },
            },
          },
          { upsert: true },
        );
        enrolled += 1;
      } catch (err) {
        this.logger.debug(`journey enroll skip: ${String(err)}`);
      }
    }
    return { enrolled };
  }

  async listJourneys(clubId: string) {
    const items = await this.journeyModel
      .find({
        clubId: new Types.ObjectId(clubId),
        status: LifecycleJourneyStatus.ACTIVE,
      })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return {
      result: items.map((j) => ({
        id: j._id.toString(),
        clubId: j.clubId.toString(),
        userId: j.userId.toString(),
        segmentKind: j.segmentKind,
        status: j.status,
        step: j.step,
        nextActionAt: j.nextActionAt ?? null,
        context: j.context,
      })),
    };
  }

  async listBroadcasts(
    ownerId: string,
    clubId: string,
    query: ListClubBroadcastsQueryDto,
  ) {
    await this.requireClubOwner(ownerId, clubId);
    const filter = { clubId: this.oid(clubId) };
    const [items, total] = await Promise.all([
      this.broadcastModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .lean(),
      this.broadcastModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.broadcastView(item)),
      total,
      query.page,
      query.pageSize,
    );
  }

  async createBroadcast(
    ownerId: string,
    clubId: string,
    dto: CreateClubBroadcastDto,
  ) {
    const fingerprint = this.broadcastFingerprint(dto);
    const replay = await this.findBroadcastReplay(clubId, dto, fingerprint);
    if (replay) return replay;

    try {
      return await this.transactions.run(async (session) => {
        await this.requireClubOwner(ownerId, clubId, session);
        const inTransactionReplay = await this.findBroadcastReplay(
          clubId,
          dto,
          fingerprint,
          session,
        );
        if (inTransactionReplay) return inTransactionReplay;

        const recipientIds = await this.resolveBroadcastAudience(
          clubId,
          dto.audience,
          session,
        );
        if (recipientIds.length > 500) {
          throw new BadRequestException('Broadcast audience exceeds 500 users');
        }

        const [broadcast] = await this.broadcastModel.create(
          [
            {
              clubId: this.oid(clubId),
              createdBy: this.oid(ownerId),
              title: dto.title.trim(),
              body: dto.body.trim(),
              audience: dto.audience,
              status: ClubBroadcastStatus.QUEUED,
              recipientCount: recipientIds.length,
              idempotencyKey: dto.idempotencyKey,
              mutationFingerprint: fingerprint,
            },
          ],
          { session },
        );

        for (const userId of recipientIds) {
          await this.outbox.enqueue(
            {
              eventName: 'club.broadcast_queued',
              idempotencyKey: `broadcast:${broadcast._id.toString()}:${userId}`,
              payload: {
                clubId,
                broadcastId: broadcast._id.toString(),
                notification: {
                  userId,
                  templateKey: NotificationTemplateKey.CLUB_BROADCAST,
                  params: { title: dto.title.trim(), body: dto.body.trim() },
                  payload: { clubId, broadcastId: broadcast._id.toString() },
                },
              },
            },
            session,
          );
        }
        return this.broadcastView(broadcast.toObject());
      });
    } catch (error: unknown) {
      if (!this.isDuplicateKey(error)) throw error;
      const winner = await this.findBroadcastReplay(clubId, dto, fingerprint);
      if (!winner) throw error;
      return winner;
    }
  }

  private async resolveBroadcastAudience(
    clubId: string,
    audience: ClubBroadcastAudience,
    session: ClientSession,
  ) {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * DAY_MS);
    const match: Record<string, unknown> = {
      clubId: this.oid(clubId),
      'holder.userId': { $type: 'objectId' },
    };
    if (audience === ClubBroadcastAudience.ACTIVE_MEMBERS) {
      match.status = MembershipStatus.ACTIVE;
    } else if (audience === ClubBroadcastAudience.AT_RISK) {
      match.status = MembershipStatus.ACTIVE;
      match.$or = [
        { 'credit.expiresAt': { $gte: now, $lte: in7 } },
        { 'credit.remainingSessions': { $gte: 0, $lte: 3 } },
      ];
    }
    const rows = await this.membershipModel
      .aggregate<{ _id: Types.ObjectId }>([
        { $match: match },
        { $group: { _id: '$holder.userId' } },
        { $limit: 501 },
      ])
      .session(session);
    return rows.map((row) => row._id.toString());
  }

  private async requireClubOwner(
    ownerId: string,
    clubId: string,
    session?: ClientSession,
  ) {
    const club = await this.clubModel
      .exists({ _id: this.oid(clubId), ownerId: this.oid(ownerId) })
      .session(session ?? null);
    if (!club) throw new ForbiddenException('Club ownership required');
  }

  private async findBroadcastReplay(
    clubId: string,
    dto: CreateClubBroadcastDto,
    fingerprint: string,
    session?: ClientSession,
  ) {
    const existing = await this.broadcastModel
      .findOne({ clubId: this.oid(clubId), idempotencyKey: dto.idempotencyKey })
      .session(session ?? null)
      .lean();
    if (!existing) return null;
    if (existing.mutationFingerprint !== fingerprint) {
      throw new ConflictException('Idempotency key payload mismatch');
    }
    return this.broadcastView(existing);
  }

  private broadcastFingerprint(dto: CreateClubBroadcastDto) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          title: dto.title.trim(),
          body: dto.body.trim(),
          audience: dto.audience,
        }),
      )
      .digest('hex');
  }

  private broadcastView(item: {
    _id: Types.ObjectId;
    clubId: Types.ObjectId;
    title: string;
    body: string;
    audience: string;
    status: string;
    recipientCount: number;
    createdAt: Date;
  }) {
    return {
      id: item._id.toString(),
      clubId: item.clubId.toString(),
      title: item.title,
      body: item.body,
      audience: item.audience,
      status: item.status,
      recipientCount: item.recipientCount,
      createdAt: item.createdAt,
    };
  }

  private oid(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new ForbiddenException('Club ownership required');
    }
    return new Types.ObjectId(value);
  }

  private isDuplicateKey(error: unknown): error is { code: 11000 } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }

  private memberRow(m: {
    _id: Types.ObjectId;
    holder?: { userId?: Types.ObjectId };
    credit?: {
      remainingSessions?: number;
      remainingEntries?: number;
      expiresAt?: Date;
    };
    status: string;
  }) {
    return {
      id: m._id.toString(),
      userId: m.holder?.userId?.toString() ?? null,
      status: m.status,
      remainingSessions: m.credit?.remainingSessions ?? null,
      remainingEntries: m.credit?.remainingEntries ?? null,
      expiresAt: m.credit?.expiresAt ?? null,
    };
  }

  // ── Worker entrypoints (R6–R7) ─────────────────────────────────────────

  /** Enroll matching members across ALL clubs into retention journeys. */
  async enrollAllDue() {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * DAY_MS);
    const activeWithHolder = {
      status: MembershipStatus.ACTIVE,
      'holder.userId': { $exists: true },
    };

    const [expiring, lowCredits] = await Promise.all([
      this.membershipModel
        .find({
          ...activeWithHolder,
          'credit.expiresAt': { $gte: now, $lte: in7 },
        })
        .limit(500)
        .lean<MembershipLean[]>(),
      this.membershipModel
        .find({
          ...activeWithHolder,
          'credit.remainingSessions': { $lte: 3, $gte: 0 },
        })
        .limit(500)
        .lean<MembershipLean[]>(),
    ]);

    let enrolled = 0;
    enrolled += await this.enrollRows(
      expiring,
      LifecycleSegmentKind.EXPIRING_SOON,
    );
    enrolled += await this.enrollRows(
      lowCredits,
      LifecycleSegmentKind.LOW_CREDITS,
    );
    enrolled += await this.enrollNoVisit(now);
    return { enrolled };
  }

  /** Members with an active membership but no check-in for 14+ days. */
  private async enrollNoVisit(now: Date) {
    const cutoff = new Date(now.getTime() - 14 * DAY_MS);
    const memberships = await this.membershipModel
      .find({
        status: MembershipStatus.ACTIVE,
        'holder.userId': { $exists: true },
        createdAt: { $lte: cutoff },
      })
      .limit(500)
      .lean<MembershipLean[]>();
    if (memberships.length === 0) return 0;

    const userIds = memberships
      .map((m) => m.holder?.userId)
      .filter((id): id is Types.ObjectId => Boolean(id));
    const lastVisits = await this.checkInModel.aggregate<{
      _id: { clubId: Types.ObjectId | null; userId: Types.ObjectId };
      last: Date;
    }>([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: { clubId: '$clubId', userId: '$userId' },
          last: { $max: '$occurredAt' },
        },
      },
    ]);
    const lastByKey = new Map<string, Date>();
    for (const row of lastVisits) {
      lastByKey.set(
        `${row._id.clubId?.toString() ?? ''}:${row._id.userId.toString()}`,
        row.last,
      );
    }

    const dormant = memberships.filter((m) => {
      const key = `${m.clubId.toString()}:${m.holder!.userId!.toString()}`;
      const last = lastByKey.get(key);
      return !last || last.getTime() < cutoff.getTime();
    });
    return this.enrollRows(dormant, LifecycleSegmentKind.NO_VISIT);
  }

  private async enrollRows(
    rows: MembershipLean[],
    segmentKind: LifecycleSegmentKind,
  ) {
    let enrolled = 0;
    for (const m of rows) {
      const userId = m.holder?.userId;
      if (!userId) continue;
      try {
        const res = await this.journeyModel.updateOne(
          {
            clubId: m.clubId,
            userId,
            segmentKind,
            status: LifecycleJourneyStatus.ACTIVE,
          },
          {
            $setOnInsert: {
              clubId: m.clubId,
              userId,
              segmentKind,
              status: LifecycleJourneyStatus.ACTIVE,
              step: 0,
              nextActionAt: new Date(),
              context: { membershipId: m._id.toString() },
            },
          },
          { upsert: true },
        );
        if (res.upsertedCount > 0) enrolled += 1;
      } catch (err) {
        this.logger.debug(`journey enroll skip: ${String(err)}`);
      }
    }
    return enrolled;
  }

  /**
   * Advance journeys whose `nextActionAt` is due: complete resolved risks,
   * otherwise enqueue the step reminder (idempotent per journey+step) and
   * schedule the next step. Optionally scoped to one club (owner trigger).
   */
  async advanceDueJourneys(options: { clubId?: string; limit?: number } = {}) {
    const filter: Record<string, unknown> = {
      status: LifecycleJourneyStatus.ACTIVE,
      nextActionAt: { $lte: new Date() },
    };
    if (options.clubId) filter.clubId = new Types.ObjectId(options.clubId);

    const due = await this.journeyModel
      .find(filter)
      .sort({ nextActionAt: 1 })
      .limit(options.limit ?? 100);

    const clubNames = new Map<string, string>();
    let sent = 0;
    let completed = 0;

    for (const journey of due) {
      const membershipId = journey.context?.membershipId as string | undefined;
      const membership = membershipId
        ? await this.membershipModel.findById(membershipId).lean()
        : null;

      if (this.riskResolved(journey.segmentKind, membership)) {
        journey.status = LifecycleJourneyStatus.COMPLETED;
        journey.nextActionAt = undefined;
        await journey.save();
        completed += 1;
        continue;
      }

      const clubName = await this.resolveClubName(
        journey.clubId.toString(),
        clubNames,
      );
      const step = this.stepNotification(journey.segmentKind, {
        clubName,
        membership,
      });
      await this.outbox.enqueue({
        eventName: `lifecycle.${journey.segmentKind}`,
        payload: {
          journeyId: journey._id.toString(),
          step: journey.step,
          clubId: journey.clubId.toString(),
          notification: {
            userId: journey.userId.toString(),
            templateKey: step.templateKey,
            params: step.params,
            payload: {
              kind: 'lifecycle',
              segmentKind: journey.segmentKind,
              clubId: journey.clubId.toString(),
            },
          },
        },
        idempotencyKey: `lifecycle:${journey._id.toString()}:step:${journey.step}`,
      });
      sent += 1;

      journey.step += 1;
      if (journey.step >= MAX_JOURNEY_STEPS) {
        journey.status = LifecycleJourneyStatus.COMPLETED;
        journey.nextActionAt = undefined;
        completed += 1;
      } else {
        journey.nextActionAt = new Date(
          Date.now() + STEP_INTERVAL_DAYS * DAY_MS,
        );
      }
      await journey.save();
    }

    return { due: due.length, sent, completed };
  }

  /** Journey goal reached (renewal / recharge / churn) → stop reminders. */
  private riskResolved(
    segmentKind: LifecycleSegmentKind,
    membership: {
      status?: string;
      credit?: { remainingSessions?: number; expiresAt?: Date };
    } | null,
  ): boolean {
    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      return true;
    }
    if (segmentKind === LifecycleSegmentKind.EXPIRING_SOON) {
      const expiresAt = membership.credit?.expiresAt;
      return !expiresAt || expiresAt.getTime() > Date.now() + 7 * DAY_MS;
    }
    if (segmentKind === LifecycleSegmentKind.LOW_CREDITS) {
      const remaining = membership.credit?.remainingSessions;
      return remaining == null || remaining > 3;
    }
    return false;
  }

  private stepNotification(
    segmentKind: LifecycleSegmentKind,
    ctx: {
      clubName: string;
      membership: {
        credit?: { remainingSessions?: number; expiresAt?: Date };
      } | null;
    },
  ): {
    templateKey: NotificationTemplateKey;
    params: Record<string, string | number>;
  } {
    if (segmentKind === LifecycleSegmentKind.LOW_CREDITS) {
      return {
        templateKey: NotificationTemplateKey.LIFECYCLE_LOW_CREDITS,
        params: {
          clubName: ctx.clubName,
          remaining: ctx.membership?.credit?.remainingSessions ?? 0,
        },
      };
    }
    if (segmentKind === LifecycleSegmentKind.EXPIRING_SOON) {
      const expiresAt = ctx.membership?.credit?.expiresAt;
      const daysLeft = expiresAt
        ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS))
        : 0;
      return {
        templateKey: NotificationTemplateKey.MEMBERSHIP_EXPIRING,
        params: { clubName: ctx.clubName, daysLeft },
      };
    }
    return {
      templateKey: NotificationTemplateKey.LIFECYCLE_WIN_BACK,
      params: { clubName: ctx.clubName },
    };
  }

  private async resolveClubName(
    clubId: string,
    cache: Map<string, string>,
  ): Promise<string> {
    const cached = cache.get(clubId);
    if (cached) return cached;
    const club = await this.clubModel
      .findById(clubId)
      .select('identity.name')
      .lean();
    const name = club?.identity?.name ?? 'باشگاه';
    cache.set(clubId, name);
    return name;
  }
}
