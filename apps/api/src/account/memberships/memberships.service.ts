import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types, type QueryFilter } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  MembershipTransferPolicy,
  PlatformSubscriptionStatus,
  PublishStatus,
  SubscriptionRenewalMode,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  ClubMembershipPlan,
  ClubMembershipPlanDocument,
} from '../../schemas/club-membership-plan.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../../schemas/club-membership.schema';
import {
  MembershipEvent,
  MembershipEventDocument,
} from '../../schemas/membership-event.schema';
import {
  PlatformPlan,
  PlatformPlanDocument,
} from '../../schemas/platform-plan.schema';
import {
  PlatformSubscription,
  PlatformSubscriptionDocument,
} from '../../schemas/platform-subscription.schema';
import {
  CancelMembershipDto,
  CancelPlatformSubscriptionDto,
  ConsumeMembershipCreditDto,
  CreateMembershipPlanDto,
  CreatePlatformPlanDto,
  FreezeMembershipDto,
  ListClubMembershipsQueryDto,
  ListMembershipPlansQueryDto,
  ListMyMembershipsQueryDto,
  ListPlatformPlansQueryDto,
  ListPlatformSubscriptionsQueryDto,
  SelfPurchaseMembershipDto,
  SellMembershipDto,
  SubscribePlatformDto,
  TransferMembershipDto,
  UnfreezeMembershipDto,
  UpdateMembershipPlanDto,
  UpdatePlatformPlanDto,
} from './dto/membership.dto';

type ActorRef = {
  userId: string;
  kind: MembershipActorKind;
};

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubMembershipPlan.name)
    private readonly planModel: Model<ClubMembershipPlanDocument>,
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(MembershipEvent.name)
    private readonly eventModel: Model<MembershipEventDocument>,
    @InjectModel(PlatformPlan.name)
    private readonly platformPlanModel: Model<PlatformPlanDocument>,
    @InjectModel(PlatformSubscription.name)
    private readonly platformSubModel: Model<PlatformSubscriptionDocument>,
    private readonly audit: AuditService,
  ) {}

  // ── Access ──────────────────────────────────────────────────────────────

  async requireOwnedClub(ownerId: string, clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(new Types.ObjectId(clubId));
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  // ── Club membership plans (owner) ───────────────────────────────────────

  async createPlan(
    clubId: string,
    dto: CreateMembershipPlanDto,
    actorId: string,
    request?: Request,
  ) {
    this.assertPlanKindFields(dto);

    const plan = await this.planModel.create({
      clubId: new Types.ObjectId(clubId),
      name: dto.name,
      description: dto.description,
      kind: dto.kind,
      pricing: {
        amount: dto.pricing.amount,
        tax: dto.pricing.tax,
        currency: dto.pricing.currency ?? 'IRT',
      },
      rules: {
        freezeMaxDays: dto.rules?.freezeMaxDays,
        transferPolicy:
          dto.rules?.transferPolicy ?? MembershipTransferPolicy.FORBIDDEN,
        guestPassCount: dto.rules?.guestPassCount,
      },
      durationDays: dto.durationDays,
      sessionsTotal: dto.sessionsTotal,
      entriesTotal: dto.entriesTotal,
      status: dto.status ?? EntityStatus.ACTIVE,
      publishStatus: dto.publishStatus ?? PublishStatus.DRAFT,
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_PLAN_CREATED,
      actorId,
      metadata: { clubId, planId: plan._id.toString(), kind: plan.kind },
      request,
    });

    return this.toPlanPublic(plan);
  }

  async updatePlan(
    clubId: string,
    planId: string,
    dto: UpdateMembershipPlanDto,
    actorId: string,
    request?: Request,
  ) {
    const plan = await this.findPlanOrFail(clubId, planId);

    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.pricing !== undefined) {
      plan.pricing = {
        amount: dto.pricing.amount,
        tax: dto.pricing.tax,
        currency: dto.pricing.currency ?? plan.pricing.currency ?? 'IRT',
      };
    }
    if (dto.rules !== undefined) {
      plan.rules = {
        freezeMaxDays: dto.rules.freezeMaxDays ?? plan.rules?.freezeMaxDays,
        transferPolicy:
          dto.rules.transferPolicy ??
          plan.rules?.transferPolicy ??
          MembershipTransferPolicy.FORBIDDEN,
        guestPassCount:
          dto.rules.guestPassCount ?? plan.rules?.guestPassCount,
      };
    }
    if (dto.durationDays !== undefined) plan.durationDays = dto.durationDays;
    if (dto.sessionsTotal !== undefined) plan.sessionsTotal = dto.sessionsTotal;
    if (dto.entriesTotal !== undefined) plan.entriesTotal = dto.entriesTotal;
    if (dto.status !== undefined) plan.status = dto.status;
    if (dto.publishStatus !== undefined) plan.publishStatus = dto.publishStatus;

    this.assertPlanKindFields({
      kind: plan.kind,
      durationDays: plan.durationDays,
      sessionsTotal: plan.sessionsTotal,
      entriesTotal: plan.entriesTotal,
    });

    await plan.save();

    this.audit.log({
      action: AuditAction.MEMBERSHIP_PLAN_UPDATED,
      actorId,
      metadata: { clubId, planId: plan._id.toString() },
      request,
    });

    return this.toPlanPublic(plan);
  }

  async listPlans(clubId: string, query: ListMembershipPlansQueryDto) {
    const filter: QueryFilter<ClubMembershipPlanDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.status) filter.status = query.status;
    if (query.publishStatus) filter.publishStatus = query.publishStatus;
    if (query.kind) filter.kind = query.kind;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.planModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.planModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((p) => this.toPlanPublic(p)),
      total,
      page,
      pageSize,
    );
  }

  async getPlan(clubId: string, planId: string) {
    const plan = await this.findPlanOrFail(clubId, planId);
    return this.toPlanPublic(plan);
  }

  // ── Sell / list memberships ─────────────────────────────────────────────

  async sellMembership(
    clubId: string,
    dto: SellMembershipDto,
    actor: ActorRef,
    request?: Request,
  ) {
    const holder = this.normalizeHolder(dto.holder);
    const plan = await this.findSellablePlan(clubId, dto.planId);
    const credit = this.buildCreditFromPlan(plan);

    const membership = await this.membershipModel.create({
      clubId: new Types.ObjectId(clubId),
      planId: plan._id,
      holder,
      status: MembershipStatus.ACTIVE,
      credit,
      soldBy: new Types.ObjectId(actor.userId),
      paymentId: dto.paymentId
        ? new Types.ObjectId(dto.paymentId)
        : undefined,
    });

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.SOLD,
      actor,
      payload: {
        planId: plan._id.toString(),
        clubId,
        paymentId: dto.paymentId,
      },
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_SOLD,
      actorId: actor.userId,
      targetUserId: holder.userId?.toString(),
      metadata: {
        clubId,
        membershipId: membership._id.toString(),
        planId: plan._id.toString(),
      },
      request,
    });

    return this.toMembershipPublic(membership);
  }

  /** Athlete self-purchase of a published active plan. */
  async selfPurchase(
    userId: string,
    dto: SelfPurchaseMembershipDto,
    request?: Request,
  ) {
    if (!Types.ObjectId.isValid(dto.clubId)) {
      throw new NotFoundException('Club not found');
    }
    await this.findClubOrFail(dto.clubId);

    const plan = await this.findPlanOrFail(dto.clubId, dto.planId);
    if (plan.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException('Membership plan is not active');
    }
    if (plan.publishStatus !== PublishStatus.PUBLISHED) {
      throw new BadRequestException('Membership plan is not published');
    }

    return this.sellMembership(
      dto.clubId,
      {
        planId: dto.planId,
        holder: { userId },
        paymentId: dto.paymentId,
      },
      { userId, kind: MembershipActorKind.ATHLETE },
      request,
    );
  }

  async listClubMemberships(
    clubId: string,
    query: ListClubMembershipsQueryDto,
  ) {
    const filter: QueryFilter<ClubMembershipDocument> = {
      clubId: new Types.ObjectId(clubId),
    };
    if (query.status) filter.status = query.status;
    if (query.planId) filter.planId = new Types.ObjectId(query.planId);
    if (query.holderUserId) {
      filter['holder.userId'] = new Types.ObjectId(query.holderUserId);
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.membershipModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.membershipModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((m) => this.toMembershipPublic(m)),
      total,
      page,
      pageSize,
    );
  }

  async listMyMemberships(userId: string, query: ListMyMembershipsQueryDto) {
    const filter: QueryFilter<ClubMembershipDocument> = {
      'holder.userId': new Types.ObjectId(userId),
    };
    if (query.status) filter.status = query.status;
    if (query.clubId) filter.clubId = new Types.ObjectId(query.clubId);

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.membershipModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.membershipModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((m) => this.toMembershipPublic(m)),
      total,
      page,
      pageSize,
    );
  }

  async getClubMembership(clubId: string, membershipId: string) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    return this.toMembershipPublic(membership);
  }

  async getMyMembership(userId: string, membershipId: string) {
    const membership = await this.findMembershipOrFail(membershipId);
    if (membership.holder.userId?.toString() !== userId) {
      throw new ForbiddenException('Not your membership');
    }
    return this.toMembershipPublic(membership);
  }

  // ── Lifecycle mutations ─────────────────────────────────────────────────

  async freeze(
    membershipId: string,
    dto: FreezeMembershipDto,
    actor: ActorRef,
    clubId?: string,
    request?: Request,
  ) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Only active memberships can be frozen');
    }

    const plan = await this.planModel.findById(membership.planId);
    const maxDays = plan?.rules?.freezeMaxDays;
    if (maxDays !== undefined && maxDays <= 0) {
      throw new BadRequestException('Freeze is not allowed for this plan');
    }

    const frozenAt = new Date();
    let unfreezeAt = dto.unfreezeAt ? new Date(dto.unfreezeAt) : undefined;
    if (maxDays !== undefined && maxDays > 0) {
      const maxUnfreeze = new Date(
        frozenAt.getTime() + maxDays * 24 * 60 * 60 * 1000,
      );
      if (!unfreezeAt || unfreezeAt > maxUnfreeze) {
        unfreezeAt = maxUnfreeze;
      }
    }

    membership.status = MembershipStatus.FROZEN;
    membership.freeze = {
      frozenAt,
      unfreezeAt,
      reason: dto.reason,
    };
    await membership.save();

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.FROZEN,
      actor,
      reason: dto.reason,
      payload: { unfreezeAt: unfreezeAt?.toISOString() },
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_FROZEN,
      actorId: actor.userId,
      targetUserId: membership.holder.userId?.toString(),
      metadata: { membershipId: membership._id.toString() },
      request,
    });

    return this.toMembershipPublic(membership);
  }

  async unfreeze(
    membershipId: string,
    dto: UnfreezeMembershipDto,
    actor: ActorRef,
    clubId?: string,
    request?: Request,
  ) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    if (membership.status !== MembershipStatus.FROZEN) {
      throw new BadRequestException('Membership is not frozen');
    }

    // Extend expiry by freeze duration if credit has an expiry.
    if (membership.freeze?.frozenAt && membership.credit?.expiresAt) {
      const frozenMs =
        Date.now() - new Date(membership.freeze.frozenAt).getTime();
      if (frozenMs > 0) {
        membership.credit.expiresAt = new Date(
          new Date(membership.credit.expiresAt).getTime() + frozenMs,
        );
      }
    }

    membership.status = MembershipStatus.ACTIVE;
    membership.freeze = undefined;
    await membership.save();

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.UNFROZEN,
      actor,
      reason: dto.reason,
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_UNFROZEN,
      actorId: actor.userId,
      targetUserId: membership.holder.userId?.toString(),
      metadata: { membershipId: membership._id.toString() },
      request,
    });

    return this.toMembershipPublic(membership);
  }

  async transfer(
    membershipId: string,
    dto: TransferMembershipDto,
    actor: ActorRef,
    clubId?: string,
    request?: Request,
  ) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    if (
      membership.status !== MembershipStatus.ACTIVE &&
      membership.status !== MembershipStatus.FROZEN
    ) {
      throw new BadRequestException(
        'Only active or frozen memberships can be transferred',
      );
    }

    const plan = await this.planModel.findById(membership.planId);
    if (plan?.rules?.transferPolicy !== MembershipTransferPolicy.ALLOWED) {
      throw new BadRequestException('Transfer is forbidden for this plan');
    }

    const fromHolder = { ...membership.holder };
    const toHolder = this.normalizeHolder(dto.toHolder);

    membership.holder = toHolder;
    membership.status = MembershipStatus.TRANSFERRED;
    membership.freeze = undefined;
    await membership.save();

    // Issue a fresh ACTIVE membership for the new holder with remaining credit.
    const transferred = await this.membershipModel.create({
      clubId: membership.clubId,
      planId: membership.planId,
      holder: toHolder,
      status: MembershipStatus.ACTIVE,
      credit: {
        remainingSessions: membership.credit?.remainingSessions,
        remainingEntries: membership.credit?.remainingEntries,
        expiresAt: membership.credit?.expiresAt,
      },
      soldBy: new Types.ObjectId(actor.userId),
    });

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.TRANSFERRED,
      actor,
      reason: dto.reason,
      payload: {
        from: this.holderPublic(fromHolder),
        to: this.holderPublic(toHolder),
        newMembershipId: transferred._id.toString(),
      },
    });

    await this.appendEvent({
      membershipId: transferred._id,
      type: MembershipEventType.SOLD,
      actor,
      reason: dto.reason ?? 'Transferred from prior membership',
      payload: {
        transferredFrom: membership._id.toString(),
      },
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_TRANSFERRED,
      actorId: actor.userId,
      targetUserId: toHolder.userId?.toString(),
      metadata: {
        membershipId: membership._id.toString(),
        newMembershipId: transferred._id.toString(),
      },
      request,
    });

    return {
      previous: this.toMembershipPublic(membership),
      membership: this.toMembershipPublic(transferred),
    };
  }

  async cancel(
    membershipId: string,
    dto: CancelMembershipDto,
    actor: ActorRef,
    clubId?: string,
    request?: Request,
  ) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    if (
      membership.status === MembershipStatus.CANCELLED ||
      membership.status === MembershipStatus.EXPIRED ||
      membership.status === MembershipStatus.TRANSFERRED
    ) {
      throw new BadRequestException(
        `Cannot cancel membership in status ${membership.status}`,
      );
    }

    membership.status = MembershipStatus.CANCELLED;
    membership.freeze = undefined;
    await membership.save();

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.CANCELLED,
      actor,
      reason: dto.reason,
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_CANCELLED,
      actorId: actor.userId,
      targetUserId: membership.holder.userId?.toString(),
      metadata: { membershipId: membership._id.toString() },
      request,
    });

    return this.toMembershipPublic(membership);
  }

  async consumeCredit(
    membershipId: string,
    dto: ConsumeMembershipCreditDto,
    actor: ActorRef,
    clubId?: string,
  ) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active memberships can consume credit',
      );
    }

    if (
      membership.credit?.expiresAt &&
      new Date(membership.credit.expiresAt) < new Date()
    ) {
      membership.status = MembershipStatus.EXPIRED;
      await membership.save();
      await this.appendEvent({
        membershipId: membership._id,
        type: MembershipEventType.EXPIRED,
        actor: { kind: MembershipActorKind.SYSTEM },
      });
      throw new BadRequestException('Membership has expired');
    }

    const plan = await this.planModel.findById(membership.planId);
    const amount = dto.amount ?? 1;
    const kind =
      dto.creditKind ??
      (plan?.kind === MembershipPlanKind.ENTRIES
        ? MembershipPlanKind.ENTRIES
        : MembershipPlanKind.SESSIONS);

    if (kind === MembershipPlanKind.ENTRIES) {
      const remaining = membership.credit?.remainingEntries ?? 0;
      if (remaining < amount) {
        throw new BadRequestException('Insufficient entry credit');
      }
      membership.credit.remainingEntries = remaining - amount;
    } else if (kind === MembershipPlanKind.SESSIONS) {
      const remaining = membership.credit?.remainingSessions ?? 0;
      if (remaining < amount) {
        throw new BadRequestException('Insufficient session credit');
      }
      membership.credit.remainingSessions = remaining - amount;
    } else {
      throw new BadRequestException(
        'Duration memberships do not consume session/entry credit',
      );
    }

    await membership.save();

    await this.appendEvent({
      membershipId: membership._id,
      type: MembershipEventType.CREDIT_CONSUMED,
      actor,
      reason: dto.reason,
      payload: { creditKind: kind, amount },
    });

    return this.toMembershipPublic(membership);
  }

  async listMembershipEvents(membershipId: string, clubId?: string) {
    await this.findMembershipOrFail(membershipId, clubId);
    const items = await this.eventModel
      .find({ membershipId: new Types.ObjectId(membershipId) })
      .sort({ occurredAt: -1 })
      .limit(200);
    return {
      result: items.map((e) => this.toEventPublic(e)),
    };
  }

  // ── Platform plans (admin) ──────────────────────────────────────────────

  async adminCreatePlatformPlan(
    dto: CreatePlatformPlanDto,
    adminId: string,
    request?: Request,
  ) {
    const existing = await this.platformPlanModel.findOne({ code: dto.code });
    if (existing) {
      throw new BadRequestException('Platform plan code already exists');
    }

    const plan = await this.platformPlanModel.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      pricing: {
        amount: dto.pricing.amount,
        tax: dto.pricing.tax,
        currency: dto.pricing.currency ?? 'IRT',
        periodDays: dto.pricing.periodDays ?? 30,
      },
      features: dto.features ?? [],
      status: dto.status ?? EntityStatus.ACTIVE,
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_PLAN_CREATED,
      actorId: adminId,
      metadata: {
        scope: 'platform',
        planId: plan._id.toString(),
        code: plan.code,
      },
      request,
    });

    return this.toPlatformPlanPublic(plan);
  }

  async adminUpdatePlatformPlan(
    planId: string,
    dto: UpdatePlatformPlanDto,
    adminId: string,
    request?: Request,
  ) {
    const plan = await this.findPlatformPlanOrFail(planId);

    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.pricing !== undefined) {
      plan.pricing = {
        amount: dto.pricing.amount,
        tax: dto.pricing.tax,
        currency: dto.pricing.currency ?? plan.pricing.currency ?? 'IRT',
        periodDays: dto.pricing.periodDays ?? plan.pricing.periodDays ?? 30,
      };
    }
    if (dto.features !== undefined) plan.features = dto.features;
    if (dto.status !== undefined) plan.status = dto.status;

    await plan.save();

    this.audit.log({
      action: AuditAction.MEMBERSHIP_PLAN_UPDATED,
      actorId: adminId,
      metadata: {
        scope: 'platform',
        planId: plan._id.toString(),
        code: plan.code,
      },
      request,
    });

    return this.toPlatformPlanPublic(plan);
  }

  async adminListPlatformPlans(query: ListPlatformPlansQueryDto) {
    const filter: QueryFilter<PlatformPlanDocument> = {};
    if (query.status) filter.status = query.status;

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.platformPlanModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.platformPlanModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((p) => this.toPlatformPlanPublic(p)),
      total,
      page,
      pageSize,
    );
  }

  async adminGetPlatformPlan(planId: string) {
    const plan = await this.findPlatformPlanOrFail(planId);
    return this.toPlatformPlanPublic(plan);
  }

  async adminArchivePlatformPlan(
    planId: string,
    adminId: string,
    request?: Request,
  ) {
    const plan = await this.findPlatformPlanOrFail(planId);
    plan.status = EntityStatus.ARCHIVED;
    await plan.save();

    this.audit.log({
      action: AuditAction.MEMBERSHIP_PLAN_UPDATED,
      actorId: adminId,
      metadata: {
        scope: 'platform',
        planId: plan._id.toString(),
        status: EntityStatus.ARCHIVED,
      },
      request,
    });

    return this.toPlatformPlanPublic(plan);
  }

  async adminListPlatformSubscriptions(
    query: ListPlatformSubscriptionsQueryDto,
  ) {
    const filter: QueryFilter<PlatformSubscriptionDocument> = {};
    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = new Types.ObjectId(query.userId);
    if (query.planId) filter.planId = new Types.ObjectId(query.planId);

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.platformSubModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      this.platformSubModel.countDocuments(filter),
    ]);

    return paginatedResult(
      items.map((s) => this.toPlatformSubPublic(s)),
      total,
      page,
      pageSize,
    );
  }

  // ── Platform subscribe / cancel (account) ───────────────────────────────

  async subscribePlatform(
    userId: string,
    dto: SubscribePlatformDto,
    request?: Request,
  ) {
    const plan = await this.findPlatformPlanOrFail(dto.planId);
    if (plan.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException('Platform plan is not active');
    }

    const active = await this.platformSubModel.findOne({
      userId: new Types.ObjectId(userId),
      status: {
        $in: [
          PlatformSubscriptionStatus.ACTIVE,
          PlatformSubscriptionStatus.TRIALING,
        ],
      },
    });
    if (active) {
      throw new BadRequestException(
        'User already has an active platform subscription',
      );
    }

    const start = new Date();
    const periodDays = plan.pricing.periodDays ?? 30;
    const end = new Date(start.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const sub = await this.platformSubModel.create({
      userId: new Types.ObjectId(userId),
      planId: plan._id,
      status: PlatformSubscriptionStatus.ACTIVE,
      period: { start, end },
      renewal: {
        mode: dto.renewal?.mode ?? SubscriptionRenewalMode.MANUAL,
      },
    });

    this.audit.log({
      action: AuditAction.MEMBERSHIP_SOLD,
      actorId: userId,
      targetUserId: userId,
      metadata: {
        scope: 'platform',
        subscriptionId: sub._id.toString(),
        planId: plan._id.toString(),
      },
      request,
    });

    return this.toPlatformSubPublic(sub);
  }

  async cancelPlatformSubscription(
    userId: string,
    subscriptionId: string,
    dto: CancelPlatformSubscriptionDto,
    request?: Request,
  ) {
    if (!Types.ObjectId.isValid(subscriptionId)) {
      throw new NotFoundException('Subscription not found');
    }
    const sub = await this.platformSubModel.findById(subscriptionId);
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.userId.toString() !== userId) {
      throw new ForbiddenException('Not your subscription');
    }
    if (
      sub.status === PlatformSubscriptionStatus.CANCELLED ||
      sub.status === PlatformSubscriptionStatus.EXPIRED
    ) {
      throw new BadRequestException(
        `Cannot cancel subscription in status ${sub.status}`,
      );
    }

    sub.status = PlatformSubscriptionStatus.CANCELLED;
    sub.renewal = { mode: SubscriptionRenewalMode.MANUAL };
    await sub.save();

    this.audit.log({
      action: AuditAction.MEMBERSHIP_CANCELLED,
      actorId: userId,
      targetUserId: userId,
      metadata: {
        scope: 'platform',
        subscriptionId: sub._id.toString(),
        reason: dto.reason,
      },
      request,
    });

    return this.toPlatformSubPublic(sub);
  }

  async listMyPlatformSubscriptions(userId: string) {
    const items = await this.platformSubModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return {
      result: items.map((s) => this.toPlatformSubPublic(s)),
    };
  }

  // ── Internals ───────────────────────────────────────────────────────────

  private assertPlanKindFields(input: {
    kind: MembershipPlanKind;
    durationDays?: number;
    sessionsTotal?: number;
    entriesTotal?: number;
  }) {
    if (
      input.kind === MembershipPlanKind.DURATION &&
      !(input.durationDays && input.durationDays > 0)
    ) {
      throw new BadRequestException(
        'durationDays is required for duration plans',
      );
    }
    if (
      input.kind === MembershipPlanKind.SESSIONS &&
      !(input.sessionsTotal && input.sessionsTotal > 0)
    ) {
      throw new BadRequestException(
        'sessionsTotal is required for sessions plans',
      );
    }
    if (
      input.kind === MembershipPlanKind.ENTRIES &&
      !(input.entriesTotal && input.entriesTotal > 0)
    ) {
      throw new BadRequestException(
        'entriesTotal is required for entries plans',
      );
    }
  }

  private normalizeHolder(holder: {
    userId?: string;
    guest?: { name: string; phone: string };
  }) {
    if (!holder.userId && !holder.guest) {
      throw new BadRequestException(
        'Holder must include userId or guest { name, phone }',
      );
    }
    if (holder.userId && !Types.ObjectId.isValid(holder.userId)) {
      throw new BadRequestException('Invalid holder userId');
    }
    return {
      userId: holder.userId
        ? new Types.ObjectId(holder.userId)
        : undefined,
      guest: holder.guest
        ? { name: holder.guest.name, phone: holder.guest.phone }
        : undefined,
    };
  }

  private buildCreditFromPlan(plan: ClubMembershipPlanDocument) {
    const credit: {
      remainingSessions?: number;
      remainingEntries?: number;
      expiresAt?: Date;
    } = {};

    if (plan.kind === MembershipPlanKind.DURATION) {
      const days = plan.durationDays ?? 30;
      credit.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else if (plan.kind === MembershipPlanKind.SESSIONS) {
      credit.remainingSessions = plan.sessionsTotal;
    } else if (plan.kind === MembershipPlanKind.ENTRIES) {
      credit.remainingEntries = plan.entriesTotal;
    }

    return credit;
  }

  private async findClubOrFail(clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  private async findPlanOrFail(clubId: string, planId: string) {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException('Membership plan not found');
    }
    const plan = await this.planModel.findOne({
      _id: new Types.ObjectId(planId),
      clubId: new Types.ObjectId(clubId),
    });
    if (!plan) throw new NotFoundException('Membership plan not found');
    return plan;
  }

  private async findSellablePlan(clubId: string, planId: string) {
    const plan = await this.findPlanOrFail(clubId, planId);
    if (plan.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException('Membership plan is not active');
    }
    return plan;
  }

  private async findMembershipOrFail(membershipId: string, clubId?: string) {
    if (!Types.ObjectId.isValid(membershipId)) {
      throw new NotFoundException('Membership not found');
    }
    const filter: QueryFilter<ClubMembershipDocument> = {
      _id: new Types.ObjectId(membershipId),
    };
    if (clubId) filter.clubId = new Types.ObjectId(clubId);

    const membership = await this.membershipModel.findOne(filter);
    if (!membership) throw new NotFoundException('Membership not found');
    return membership;
  }

  private async findPlatformPlanOrFail(planId: string) {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException('Platform plan not found');
    }
    const plan = await this.platformPlanModel.findById(planId);
    if (!plan) throw new NotFoundException('Platform plan not found');
    return plan;
  }

  private async appendEvent(input: {
    membershipId: Types.ObjectId;
    type: MembershipEventType;
    actor: { userId?: string; kind: MembershipActorKind };
    reason?: string;
    payload?: Record<string, unknown>;
  }) {
    await this.eventModel.create({
      membershipId: input.membershipId,
      type: input.type,
      actor: {
        userId: input.actor.userId
          ? new Types.ObjectId(input.actor.userId)
          : undefined,
        kind: input.actor.kind,
      },
      reason: input.reason,
      payload: input.payload,
      occurredAt: new Date(),
    });
  }

  private holderPublic(holder: {
    userId?: Types.ObjectId;
    guest?: { name: string; phone: string };
  }) {
    return {
      userId: holder.userId?.toString(),
      guest: holder.guest
        ? { name: holder.guest.name, phone: holder.guest.phone }
        : undefined,
    };
  }

  private toPlanPublic(plan: ClubMembershipPlanDocument) {
    return {
      id: plan._id.toString(),
      clubId: plan.clubId.toString(),
      name: plan.name,
      description: plan.description,
      kind: plan.kind,
      pricing: {
        amount: plan.pricing.amount,
        tax: plan.pricing.tax,
        currency: plan.pricing.currency,
      },
      rules: {
        freezeMaxDays: plan.rules?.freezeMaxDays,
        transferPolicy: plan.rules?.transferPolicy,
        guestPassCount: plan.rules?.guestPassCount,
      },
      durationDays: plan.durationDays,
      sessionsTotal: plan.sessionsTotal,
      entriesTotal: plan.entriesTotal,
      status: plan.status,
      publishStatus: plan.publishStatus,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private toMembershipPublic(m: ClubMembershipDocument) {
    return {
      id: m._id.toString(),
      clubId: m.clubId.toString(),
      planId: m.planId.toString(),
      holder: this.holderPublic(m.holder),
      status: m.status,
      credit: {
        remainingSessions: m.credit?.remainingSessions,
        remainingEntries: m.credit?.remainingEntries,
        expiresAt: m.credit?.expiresAt,
      },
      freeze: m.freeze
        ? {
            frozenAt: m.freeze.frozenAt,
            unfreezeAt: m.freeze.unfreezeAt,
            reason: m.freeze.reason,
          }
        : undefined,
      soldBy: m.soldBy?.toString(),
      paymentId: m.paymentId?.toString(),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  private toEventPublic(e: MembershipEventDocument) {
    return {
      id: e._id.toString(),
      membershipId: e.membershipId.toString(),
      type: e.type,
      actor: {
        userId: e.actor.userId?.toString(),
        kind: e.actor.kind,
      },
      reason: e.reason,
      payload: e.payload,
      occurredAt: e.occurredAt,
      createdAt: e.createdAt,
    };
  }

  private toPlatformPlanPublic(plan: PlatformPlanDocument) {
    return {
      id: plan._id.toString(),
      code: plan.code,
      name: plan.name,
      description: plan.description,
      pricing: {
        amount: plan.pricing.amount,
        tax: plan.pricing.tax,
        currency: plan.pricing.currency,
        periodDays: plan.pricing.periodDays,
      },
      features: plan.features ?? [],
      status: plan.status,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private toPlatformSubPublic(sub: PlatformSubscriptionDocument) {
    return {
      id: sub._id.toString(),
      userId: sub.userId.toString(),
      planId: sub.planId.toString(),
      status: sub.status,
      period: {
        start: sub.period.start,
        end: sub.period.end,
      },
      renewal: {
        mode: sub.renewal?.mode ?? SubscriptionRenewalMode.MANUAL,
      },
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }
}
