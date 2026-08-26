import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { EventWriterService } from '../../../../analytics/event-writer.service';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import {
  AnalyticsEventName,
  ClubLifecycleStatus,
  ClubStaffStatus,
  EntityStatus,
  MembershipStatus,
  PlatformSubscriptionStatus,
} from '../../../../common/enums';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import {
  ClubMembership,
  type ClubMembershipDocument,
} from '../../../../schemas/club-membership.schema';
import {
  ClubStaff,
  type ClubStaffDocument,
} from '../../../../schemas/club-staff.schema';
import {
  PlatformPlan,
  type PlatformPlanDocument,
  PlatformEntitlementKey,
  PlatformEntitlementLimit,
} from '../../../../schemas/platform-plan.schema';
import {
  PlatformSubscription,
  type PlatformSubscriptionDocument,
} from '../../../../schemas/platform-subscription.schema';
import {
  PlatformEntitlementBoundary,
  type PlatformEntitlementBoundaryDocument,
} from '../../../../schemas/platform-entitlement-boundary.schema';
import {
  PlatformEntitlementUsage,
  type PlatformEntitlementUsageDocument,
} from '../../../../schemas/platform-entitlement-usage.schema';

export type PlatformEntitlementState =
  | 'active'
  | 'grace'
  | 'read_only'
  | 'legacy_unlimited'
  | 'missing';

export type PlatformEntitlementReasonCode =
  | 'allowed'
  | 'legacy_unlimited'
  | 'subscription_required'
  | 'subscription_grace_read_only'
  | 'subscription_expired'
  | 'entitlement_not_included'
  | 'entitlement_limit_reached'
  | 'soft_limit_exceeded';

export type PlatformEntitlementDecision = {
  allowed: boolean;
  reasonCode: PlatformEntitlementReasonCode;
  usage: number | null;
  limit: number | null;
  state: PlatformEntitlementState;
  mode: 'hard' | 'soft' | null;
  upgradePlanIds: string[];
};

/** Server-authoritative entitlement decisions. Feature labels never grant access. */
@Injectable()
export class PlatformEntitlementService {
  constructor(
    @InjectModel(PlatformSubscription.name)
    private readonly subscriptions: Model<PlatformSubscriptionDocument>,
    @InjectModel(Club.name)
    private readonly clubs: Model<ClubDocument>,
    @InjectModel(ClubStaff.name)
    private readonly staff: Model<ClubStaffDocument>,
    @InjectModel(ClubMembership.name)
    private readonly memberships: Model<ClubMembershipDocument>,
    @InjectModel(PlatformPlan.name)
    private readonly plans: Model<PlatformPlanDocument>,
    @InjectModel(PlatformEntitlementBoundary.name)
    private readonly boundaries: Model<PlatformEntitlementBoundaryDocument>,
    @InjectModel(PlatformEntitlementUsage.name)
    private readonly usageFacts: Model<PlatformEntitlementUsageDocument>,
    private readonly transactions: MongoTransactionService,
    private readonly events: EventWriterService,
  ) {}

  async evaluate(input: {
    userId: string;
    key: PlatformEntitlementKey;
    clubId?: string;
    incrementBy?: number;
    now?: Date;
    session?: ClientSession;
  }): Promise<PlatformEntitlementDecision> {
    const now = input.now ?? new Date();
    const subscriptionQuery = this.subscriptions.findOne({
      userId: new Types.ObjectId(input.userId),
      currentEntitlementKey: 'current',
      status: {
        $in: [
          PlatformSubscriptionStatus.ACTIVE,
          PlatformSubscriptionStatus.TRIALING,
          PlatformSubscriptionStatus.PAST_DUE,
        ],
      },
    });
    if (input.session) subscriptionQuery.session(input.session);
    const subscription = await subscriptionQuery;
    if (!subscription) {
      const audience = input.key === 'students.active' ? 'coach' : 'club_owner';
      const rolloutQuery = this.plans.exists({
        contractReady: true,
        'entitlementContract.audience': audience,
      });
      if (input.session) rolloutQuery.session(input.session);
      const rolloutReady = await rolloutQuery;
      if (!rolloutReady) {
        return {
          allowed: true,
          reasonCode: 'legacy_unlimited',
          usage: null,
          limit: null,
          state: 'legacy_unlimited',
          mode: null,
          upgradePlanIds: [],
        };
      }
      return this.denied('subscription_required', 'missing', undefined, {
        userId: input.userId,
        key: input.key,
        session: input.session,
      });
    }

    const state = this.resolveState(subscription, now);
    if (!subscription.entitlementSnapshot) {
      return {
        allowed: true,
        reasonCode: 'legacy_unlimited',
        usage: null,
        limit: null,
        state: 'legacy_unlimited',
        mode: null,
        upgradePlanIds: [],
      };
    }
    if (state === 'grace') {
      return this.denied('subscription_grace_read_only', state, undefined, {
        userId: input.userId,
        key: input.key,
        subscription,
        session: input.session,
      });
    }
    if (state === 'read_only') {
      return this.denied('subscription_expired', state, undefined, {
        userId: input.userId,
        key: input.key,
        subscription,
        session: input.session,
      });
    }

    const configured = subscription.entitlementSnapshot.limits.find(
      (limit) => limit.key === input.key,
    );
    if (!configured) {
      return this.denied('entitlement_not_included', state, undefined, {
        userId: input.userId,
        key: input.key,
        subscription,
        session: input.session,
      });
    }
    const usage = await this.usage(
      input.userId,
      input.key,
      input.clubId,
      input.session,
      now,
    );
    const incrementBy = input.incrementBy ?? 1;
    const projected = usage + incrementBy;
    const hardBlocked =
      configured.value !== null &&
      configured.mode === 'hard' &&
      projected > configured.value;
    const softExceeded =
      configured.value !== null &&
      configured.mode === 'soft' &&
      projected > configured.value;
    const allowed = configured.value === null || configured.mode === 'soft' || projected <= configured.value;
    const upgradePlanIds = await this.resolveUpgradePlanIds({
      userId: input.userId,
      key: input.key,
      subscription,
      session: input.session,
    });
    return {
      allowed,
      reasonCode: hardBlocked
        ? 'entitlement_limit_reached'
        : softExceeded
          ? 'soft_limit_exceeded'
          : 'allowed',
      usage,
      limit: configured.value,
      state,
      mode: configured.mode,
      upgradePlanIds,
    };
  }

  async summary(userId: string, clubId?: string) {
    const subscription = await this.subscriptions.findOne({
      userId: new Types.ObjectId(userId),
      currentEntitlementKey: 'current',
      status: {
        $in: [
          PlatformSubscriptionStatus.ACTIVE,
          PlatformSubscriptionStatus.TRIALING,
          PlatformSubscriptionStatus.PAST_DUE,
        ],
      },
    });
    if (!subscription) {
      return {
        subscriptionId: null,
        planId: null,
        state: 'missing' as const,
        period: null,
        graceEndsAt: null,
        scheduledPlanId: null,
        limits: [],
        upgradePlanIds: [],
      };
    }
    const now = new Date();
    const state = subscription.entitlementSnapshot
      ? this.resolveState(subscription, now)
      : ('legacy_unlimited' as const);
    const upgradePlanIds = await this.resolveUpgradePlanIds({
      userId,
      key: 'clubs.active',
      subscription,
    });
    const limits = await Promise.all(
      (subscription.entitlementSnapshot?.limits ?? []).map(async (limit) => {
        const requiresClub =
          limit.key === 'staff.active_per_club' ||
          limit.key === 'members.active_per_club' ||
          limit.key === 'monthly_messages.transactional';
        const usage =
          requiresClub && !clubId
            ? null
            : await this.usage(userId, limit.key, clubId);
        const reasonCode = this.summaryLimitReasonCode(state, limit, usage);
        const allowed =
          state === 'active' &&
          (limit.value === null ||
            limit.mode === 'soft' ||
            usage === null ||
            usage < limit.value);
        return {
          key: limit.key,
          value: limit.value,
          mode: limit.mode,
          usage,
          allowed,
          reasonCode,
        };
      }),
    );
    const limitUpgradePlanIds =
      limits.some(
        (limit) =>
          limit.reasonCode === 'entitlement_limit_reached' ||
          limit.reasonCode === 'soft_limit_exceeded',
      )
        ? await this.resolveUpgradePlanIds({
            userId,
            key:
              limits.find(
                (limit) =>
                  limit.reasonCode === 'entitlement_limit_reached' ||
                  limit.reasonCode === 'soft_limit_exceeded',
              )?.key ?? 'clubs.active',
            subscription,
          })
        : upgradePlanIds;
    return {
      subscriptionId: subscription._id.toString(),
      planId: subscription.planId.toString(),
      state,
      period: subscription.period,
      graceEndsAt: subscription.graceEndsAt ?? null,
      scheduledPlanId: subscription.scheduledPlanId?.toString() ?? null,
      scheduledPlanEffectiveAt: subscription.scheduledPlanEffectiveAt ?? null,
      cancellationRequestedAt: subscription.cancellationRequestedAt ?? null,
      limits,
      upgradePlanIds: limitUpgradePlanIds,
    };
  }

  async assertIncrementAllowed(input: {
    userId: string;
    key: PlatformEntitlementKey;
    clubId?: string;
    incrementBy?: number;
    session?: ClientSession;
  }) {
    const decision = await this.evaluate(input);
    if (!decision.allowed) {
      throw new ForbiddenException({
        message: `platform_subscription.${decision.reasonCode}`,
        code: decision.reasonCode,
        entitlement: decision,
      });
    }
    await this.recordSoftLimitExposureIfNeeded(input, decision);
    return decision;
  }

  async serializeAndAssertIncrement(input: {
    userId: string;
    key: PlatformEntitlementKey;
    clubId?: string;
    incrementBy?: number;
    session: ClientSession;
  }) {
    const scope = input.clubId ?? 'global';
    const boundaryId = `${input.userId}:${input.key}:${scope}`;
    await this.boundaries.updateOne(
      { _id: boundaryId },
      { $inc: { revision: 1 } },
      { upsert: true, session: input.session },
    );
    return this.assertIncrementAllowed(input);
  }

  async reserveTransactionalMessage(input: {
    ownerUserId: string;
    clubId: string;
    sourceId: string;
    now?: Date;
  }): Promise<{ idempotent: boolean }> {
    const now = input.now ?? new Date();
    return this.transactions.run(async (session) => {
      const existing = await this.usageFacts
        .findOne({
          ownerUserId: new Types.ObjectId(input.ownerUserId),
          clubId: new Types.ObjectId(input.clubId),
          key: 'monthly_messages.transactional',
          sourceId: input.sourceId,
        })
        .session(session);
      if (existing) return { idempotent: true };

      await this.serializeAndAssertIncrement({
        userId: input.ownerUserId,
        clubId: input.clubId,
        key: 'monthly_messages.transactional',
        incrementBy: 1,
        session,
      });
      await this.usageFacts.create(
        [
          {
            ownerUserId: new Types.ObjectId(input.ownerUserId),
            clubId: new Types.ObjectId(input.clubId),
            key: 'monthly_messages.transactional',
            bucket: this.tehranMonthBucket(now),
            amount: 1,
            sourceId: input.sourceId,
          },
        ],
        { session },
      );
      return { idempotent: false };
    });
  }

  private async recordSoftLimitExposureIfNeeded(
    input: {
      userId: string;
      key: PlatformEntitlementKey;
      clubId?: string;
      incrementBy?: number;
    },
    decision: PlatformEntitlementDecision,
  ) {
    if (
      decision.reasonCode !== 'soft_limit_exceeded' ||
      decision.limit === null ||
      decision.usage === null
    ) {
      return;
    }
    const scope = input.clubId ?? 'global';
    const bucket = this.tehranMonthBucket(new Date());
    await this.events.track({
      eventId: `platform_soft_limit:${input.userId}:${input.key}:${scope}:${bucket}`,
      eventName: AnalyticsEventName.PLATFORM_ENTITLEMENT_SOFT_LIMIT,
      actor: { userId: input.userId },
      context: input.clubId ? { clubId: input.clubId } : undefined,
      properties: {
        key: input.key,
        usage: decision.usage,
        limit: decision.limit,
        incrementBy: input.incrementBy ?? 1,
        upgradePlanIds: decision.upgradePlanIds,
      },
    });
  }

  private summaryLimitReasonCode(
    state: PlatformEntitlementState,
    limit: PlatformEntitlementLimit,
    usage: number | null,
  ): PlatformEntitlementReasonCode {
    if (state === 'grace') return 'subscription_grace_read_only';
    if (state === 'read_only') return 'subscription_expired';
    if (state === 'missing') return 'subscription_required';
    if (limit.value === null || usage === null) return 'allowed';
    if (usage >= limit.value && limit.mode === 'hard') {
      return 'entitlement_limit_reached';
    }
    if (usage >= limit.value && limit.mode === 'soft') {
      return 'soft_limit_exceeded';
    }
    return 'allowed';
  }

  private async resolveUpgradePlanIds(input: {
    userId: string;
    key: PlatformEntitlementKey;
    subscription?: PlatformSubscriptionDocument | null;
    session?: ClientSession;
  }): Promise<string[]> {
    const audience = input.key === 'students.active' ? 'coach' : 'club_owner';
    let currentAmount = 0;
    const currentPlanId = input.subscription?.planId?.toString();
    if (currentPlanId) {
      const currentPlanQuery = this.plans
        .findById(currentPlanId)
        .select('pricing.amount');
      if (input.session) currentPlanQuery.session(input.session);
      const currentPlan = await currentPlanQuery.lean<{ pricing?: { amount?: number } }>();
      currentAmount = currentPlan?.pricing?.amount ?? 0;
    }

    const plansQuery = this.plans
      .find({
        contractReady: true,
        status: EntityStatus.ACTIVE,
        'entitlementContract.audience': audience,
        'pricing.amount': { $gt: currentAmount },
      })
      .select('_id pricing entitlementContract')
      .sort({ 'pricing.amount': 1 });
    if (input.session) plansQuery.session(input.session);
    const candidates = await plansQuery.lean<
      Array<{
        _id: Types.ObjectId;
        entitlementContract?: { limits?: PlatformEntitlementLimit[] };
      }>
    >();

    const currentLimit = input.subscription?.entitlementSnapshot?.limits.find(
      (entry) => entry.key === input.key,
    );

    return candidates
      .filter((plan) => {
        const candidateLimit = plan.entitlementContract?.limits?.find(
          (entry) => entry.key === input.key,
        );
        if (!candidateLimit) return false;
        if (candidateLimit.value === null) return true;
        if (currentLimit?.value === null) return false;
        if (currentLimit?.value === undefined) return true;
        return candidateLimit.value > currentLimit.value;
      })
      .map((plan) => plan._id.toString());
  }

  private resolveState(
    subscription: PlatformSubscriptionDocument,
    now: Date,
  ): PlatformEntitlementState {
    if (subscription.period.end.getTime() >= now.getTime()) return 'active';
    if (
      subscription.graceEndsAt &&
      subscription.graceEndsAt.getTime() >= now.getTime()
    ) {
      return 'grace';
    }
    return 'read_only';
  }

  private async usage(
    userId: string,
    key: PlatformEntitlementKey,
    clubId?: string,
    session?: ClientSession,
    now = new Date(),
  ) {
    if (key === 'clubs.active') {
      const query = this.clubs.countDocuments({
        ownerId: new Types.ObjectId(userId),
        'review.status': ClubLifecycleStatus.APPROVED,
      });
      if (session) query.session(session);
      return query;
    }
    if (!clubId || !Types.ObjectId.isValid(clubId)) {
      throw new ForbiddenException({
        message: 'platform_subscription.club_scope_required',
        code: 'club_scope_required',
      });
    }
    const scopedClubId = new Types.ObjectId(clubId);
    const ownershipQuery = this.clubs.exists({
      _id: scopedClubId,
      ownerId: new Types.ObjectId(userId),
    });
    if (session) ownershipQuery.session(session);
    if (!(await ownershipQuery)) {
      throw new ForbiddenException({
        message: 'platform_subscription.club_scope_forbidden',
        code: 'club_scope_forbidden',
      });
    }
    if (key === 'staff.active_per_club') {
      const query = this.staff.countDocuments({
        clubId: scopedClubId,
        status: ClubStaffStatus.ACTIVE,
      });
      if (session) query.session(session);
      return query;
    }
    if (key === 'members.active_per_club') {
      const query = this.memberships.countDocuments({
        clubId: scopedClubId,
        status: MembershipStatus.ACTIVE,
      });
      if (session) query.session(session);
      return query;
    }
    if (key === 'monthly_messages.transactional') {
      const result = await this.usageFacts
        .aggregate<{ total: number }>([
          {
            $match: {
              ownerUserId: new Types.ObjectId(userId),
              clubId: scopedClubId,
              key,
              bucket: this.tehranMonthBucket(now),
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .session(session ?? null);
      return result[0]?.total ?? 0;
    }
    return Number.MAX_SAFE_INTEGER;
  }

  tehranMonthBucket(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(date);
    const value = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    return `${value.year}-${value.month}`;
  }

  private async denied(
    reasonCode: Exclude<
      PlatformEntitlementReasonCode,
      'allowed' | 'legacy_unlimited' | 'soft_limit_exceeded'
    >,
    state: PlatformEntitlementState,
    limit?: PlatformEntitlementLimit,
    upgradeContext?: {
      userId: string;
      key: PlatformEntitlementKey;
      subscription?: PlatformSubscriptionDocument | null;
      session?: ClientSession;
    },
  ): Promise<PlatformEntitlementDecision> {
    const upgradePlanIds = upgradeContext
      ? await this.resolveUpgradePlanIds(upgradeContext)
      : [];
    return {
      allowed: false,
      reasonCode,
      usage: null,
      limit: limit?.value ?? null,
      state,
      mode: limit?.mode ?? null,
      upgradePlanIds,
    };
  }
}
