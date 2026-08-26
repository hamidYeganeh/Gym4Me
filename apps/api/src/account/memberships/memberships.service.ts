import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types, type ClientSession, type QueryFilter } from 'mongoose';
import { AuditService } from '../../audit/audit.service';
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';
import {
  AuditAction,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  MembershipTransferPolicy,
  PaymentChannel,
  PlatformSubscriptionStatus,
  PublishStatus,
  SubscriptionRenewalMode,
} from '../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { normalizeIranPhone } from '../../common/utils/phone.util';
import { OutboxService } from '../../outbox/outbox.service';
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
import { User, UserDocument } from '../../schemas/user.schema';
import {
  CancelMembershipDto,
  CancelPlatformSubscriptionDto,
  ConsumeMembershipCreditDto,
  CreateMembershipPlanDto,
  CreatePlatformPlanDto,
  FreezeMembershipDto,
  ImportMembershipsDto,
  ListClubMembershipsQueryDto,
  ListMembershipPlansQueryDto,
  ListMyMembershipsQueryDto,
  ListPlatformPlansQueryDto,
  ListPlatformSubscriptionsQueryDto,
  PaginationQueryDto,
  PreviewMembershipRenewalDto,
  RenewMembershipDto,
  SelfPurchaseMembershipDto,
  SellMembershipDto,
  SubscribePlatformDto,
  SchedulePlatformPlanChangeDto,
  TransferMembershipDto,
  UnfreezeMembershipDto,
  UpdateMembershipPlanDto,
  UpdatePlatformPlanDto,
} from './dto/membership.dto';
import { SellMembershipCommand } from './application/commands/sell-membership.command';
import { RenewMembershipCommand } from './application/commands/renew-membership.command';

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
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly audit: AuditService,
    private readonly sellMembershipCommand: SellMembershipCommand,
    private readonly renewMembershipCommand: RenewMembershipCommand,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
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
        guestPassCount: dto.rules.guestPassCount ?? plan.rules?.guestPassCount,
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

  /** Public (unauthenticated) catalog: only active + published plans. */
  async listPublicPlans(clubId: string, query: PaginationQueryDto) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    await this.requireDiscoverableClub(clubId);
    const filter: QueryFilter<ClubMembershipPlanDocument> = {
      clubId: new Types.ObjectId(clubId),
      status: EntityStatus.ACTIVE,
      publishStatus: PublishStatus.PUBLISHED,
    };

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

  async getPublicPlan(clubId: string, planId: string) {
    await this.requireDiscoverableClub(clubId);
    const plan = await this.findPlanOrFail(clubId, planId);
    if (
      plan.status !== EntityStatus.ACTIVE ||
      plan.publishStatus !== PublishStatus.PUBLISHED
    ) {
      throw new NotFoundException('Membership plan not found');
    }
    return this.toPlanPublic(plan);
  }

  async listPublicPlanSummaries(clubIds: string[]) {
    const objectIds = clubIds.map((clubId) => new Types.ObjectId(clubId));
    const clubs = await this.clubModel
      .find({
        _id: { $in: objectIds },
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
      })
      .select({ _id: 1 })
      .lean();
    const visibleIds = clubs.map((club) => club._id);
    if (visibleIds.length === 0) return { items: [] };

    const rows = await this.planModel.aggregate<{
      _id: { clubId: Types.ObjectId; currency: string };
      fromAmount: number;
      planCount: number;
    }>([
      {
        $match: {
          clubId: { $in: visibleIds },
          status: EntityStatus.ACTIVE,
          publishStatus: PublishStatus.PUBLISHED,
        },
      },
      {
        $group: {
          _id: { clubId: '$clubId', currency: '$pricing.currency' },
          fromAmount: { $min: '$pricing.amount' },
          planCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.clubId': 1, '_id.currency': 1 } },
    ]);

    const offersByClub = new Map<
      string,
      Array<{ currency: string; fromAmount: number; planCount: number }>
    >();
    for (const row of rows) {
      const clubId = row._id.clubId.toString();
      const offers = offersByClub.get(clubId) ?? [];
      offers.push({
        currency: row._id.currency,
        fromAmount: row.fromAmount,
        planCount: row.planCount,
      });
      offersByClub.set(clubId, offers);
    }

    return {
      items: clubIds.flatMap((clubId) => {
        const offers = offersByClub.get(clubId);
        return offers ? [{ clubId, offers }] : [];
      }),
    };
  }

  private async requireDiscoverableClub(clubId: string) {
    const club = await this.clubModel.findOne({
      _id: new Types.ObjectId(clubId),
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  // ── Sell / list memberships ─────────────────────────────────────────────

  async sellMembership(
    clubId: string,
    dto: SellMembershipDto,
    actor: ActorRef,
    request?: Request,
    options?: {
      skipPayment?: boolean;
      importSource?: { batchKey: string; rowKey: string };
    },
  ) {
    const membership = await this.sellMembershipCommand.execute(
      clubId,
      dto,
      actor,
      request,
      options,
    );
    const [enriched] = await this.toMembershipPublicMany([membership]);
    return enriched;
  }

  /** Validate or commit members parsed by the client from a CSV file. */
  async importMemberships(
    clubId: string,
    dto: ImportMembershipsDto,
    actor: ActorRef,
    request?: Request,
  ) {
    const results: Array<{
      rowKey: string;
      status: 'valid' | 'imported' | 'skipped' | 'error';
      membershipId?: string;
      message?: string;
    }> = [];

    for (const row of dto.rows) {
      try {
        const planId = row.planId ?? dto.defaultPlanId;
        if (!planId) {
          throw new BadRequestException('planId is required');
        }
        const plan = await this.findSellablePlan(clubId, planId);
        const phone = normalizeIranPhone(row.phone);
        const user = await this.userModel.findOne({ phone }).select({ _id: 1 });
        const duplicate = await this.membershipModel.findOne({
          clubId: new Types.ObjectId(clubId),
          planId: plan._id,
          status: {
            $in: [MembershipStatus.ACTIVE, MembershipStatus.FROZEN],
          },
          ...(user
            ? { 'holder.userId': user._id }
            : { 'holder.guest.phone': phone }),
        });
        if (duplicate) {
          results.push({
            rowKey: row.rowKey,
            status: 'skipped',
            membershipId: duplicate._id.toString(),
            message: 'Active membership already exists',
          });
          continue;
        }
        if (dto.dryRun) {
          results.push({ rowKey: row.rowKey, status: 'valid' });
          continue;
        }

        const idempotencyKey = `membership-import:${clubId}:${dto.batchKey}:${row.rowKey}`;
        const membership = await this.sellMembership(
          clubId,
          {
            planId,
            holder: user
              ? { userId: user._id.toString() }
              : { guest: { name: row.name.trim(), phone } },
            idempotencyKey,
          },
          actor,
          request,
          {
            skipPayment: true,
            importSource: { batchKey: dto.batchKey, rowKey: row.rowKey },
          },
        );
        results.push({
          rowKey: row.rowKey,
          status: 'imported',
          membershipId: membership.id,
        });
      } catch (error) {
        results.push({
          rowKey: row.rowKey,
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Unknown import error',
        });
      }
    }

    const summary = results.reduce(
      (acc, result) => {
        acc[result.status] += 1;
        return acc;
      },
      { valid: 0, imported: 0, skipped: 0, error: 0 },
    );
    return {
      batchKey: dto.batchKey,
      dryRun: dto.dryRun ?? false,
      summary,
      results,
    };
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
        channel: dto.channel ?? PaymentChannel.ZARINPAL,
        idempotencyKey: dto.idempotencyKey,
        couponCode: dto.couponCode,
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
      await this.toMembershipPublicMany(items),
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
      await this.toMembershipPublicMany(items),
      total,
      page,
      pageSize,
    );
  }

  async getClubMembership(clubId: string, membershipId: string) {
    const membership = await this.findMembershipOrFail(membershipId, clubId);
    const [enriched] = await this.toMembershipPublicMany([membership]);
    return enriched;
  }

  async getMyMembership(userId: string, membershipId: string) {
    const membership = await this.findMembershipOrFail(membershipId);
    if (membership.holder.userId?.toString() !== userId) {
      throw new ForbiddenException('Not your membership');
    }
    const [enriched] = await this.toMembershipPublicMany([membership]);
    return enriched;
  }

  // ── Lifecycle mutations ─────────────────────────────────────────────────

  previewRenewal(
    clubId: string,
    membershipId: string,
    dto: PreviewMembershipRenewalDto,
  ) {
    return this.renewMembershipCommand.preview(clubId, membershipId, dto);
  }

  renew(
    clubId: string,
    membershipId: string,
    dto: RenewMembershipDto,
    actor: ActorRef,
    request?: Request,
  ) {
    return this.renewMembershipCommand.execute(
      clubId,
      membershipId,
      dto,
      actor,
      request,
    );
  }

  async freeze(
    membershipId: string,
    dto: FreezeMembershipDto,
    actor: ActorRef,
    clubId?: string,
    request?: Request,
  ) {
    const membership = await this.transactions.run(async (session) => {
      const current = await this.findMembershipOrFail(
        membershipId,
        clubId,
        session,
      );
      if (current.status !== MembershipStatus.ACTIVE) {
        throw new BadRequestException('Only active memberships can be frozen');
      }

      const plan = await this.planModel
        .findById(current.planId)
        .session(session);
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

      current.status = MembershipStatus.FROZEN;
      current.freeze = { frozenAt, unfreezeAt, reason: dto.reason };
      await current.save({ session });
      const event = await this.appendEvent(
        {
          membershipId: current._id,
          type: MembershipEventType.FROZEN,
          actor,
          reason: dto.reason,
          payload: { unfreezeAt: unfreezeAt?.toISOString() },
        },
        session,
      );
      await this.enqueueMembershipEvent(event, current, session);
      return current;
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
    const membership = await this.transactions.run(async (session) => {
      const current = await this.findMembershipOrFail(
        membershipId,
        clubId,
        session,
      );
      if (current.status !== MembershipStatus.FROZEN) {
        throw new BadRequestException('Membership is not frozen');
      }

      if (current.freeze?.frozenAt && current.credit?.expiresAt) {
        const frozenMs =
          Date.now() - new Date(current.freeze.frozenAt).getTime();
        if (frozenMs > 0) {
          current.credit.expiresAt = new Date(
            new Date(current.credit.expiresAt).getTime() + frozenMs,
          );
        }
      }

      current.status = MembershipStatus.ACTIVE;
      current.freeze = undefined;
      await current.save({ session });
      const event = await this.appendEvent(
        {
          membershipId: current._id,
          type: MembershipEventType.UNFROZEN,
          actor,
          reason: dto.reason,
        },
        session,
      );
      await this.enqueueMembershipEvent(event, current, session);
      return current;
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
    const { membership, transferred, toHolder } = await this.transactions.run(
      async (session) => {
        const current = await this.findMembershipOrFail(
          membershipId,
          clubId,
          session,
        );
        if (
          current.status !== MembershipStatus.ACTIVE &&
          current.status !== MembershipStatus.FROZEN
        ) {
          throw new BadRequestException(
            'Only active or frozen memberships can be transferred',
          );
        }

        const plan = await this.planModel
          .findById(current.planId)
          .session(session);
        if (plan?.rules?.transferPolicy !== MembershipTransferPolicy.ALLOWED) {
          throw new BadRequestException('Transfer is forbidden for this plan');
        }

        const fromHolder = {
          userId: current.holder.userId,
          guest: current.holder.guest
            ? {
                name: current.holder.guest.name,
                phone: current.holder.guest.phone,
              }
            : undefined,
        };
        const nextHolder = this.normalizeHolder(dto.toHolder);

        current.status = MembershipStatus.TRANSFERRED;
        current.freeze = undefined;
        await current.save({ session });

        const next = new this.membershipModel({
          clubId: current.clubId,
          planId: current.planId,
          holder: nextHolder,
          status: MembershipStatus.ACTIVE,
          credit: {
            remainingSessions: current.credit?.remainingSessions,
            remainingEntries: current.credit?.remainingEntries,
            expiresAt: current.credit?.expiresAt,
          },
          soldBy: new Types.ObjectId(actor.userId),
        });
        await next.save({ session });

        const transferEvent = await this.appendEvent(
          {
            membershipId: current._id,
            type: MembershipEventType.TRANSFERRED,
            actor,
            reason: dto.reason,
            payload: {
              from: this.holderPublic(fromHolder),
              to: this.holderPublic(nextHolder),
              newMembershipId: next._id.toString(),
            },
          },
          session,
        );
        const soldEvent = await this.appendEvent(
          {
            membershipId: next._id,
            type: MembershipEventType.SOLD,
            actor,
            reason: dto.reason ?? 'Transferred from prior membership',
            payload: { transferredFrom: current._id.toString() },
          },
          session,
        );
        await this.enqueueMembershipEvent(transferEvent, current, session, {
          newMembershipId: next._id.toString(),
        });
        await this.enqueueMembershipEvent(soldEvent, next, session, {
          transferredFrom: current._id.toString(),
        });
        return {
          membership: current,
          transferred: next,
          toHolder: nextHolder,
        };
      },
    );

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
    const membership = await this.transactions.run(async (session) => {
      const current = await this.findMembershipOrFail(
        membershipId,
        clubId,
        session,
      );
      if (
        current.status === MembershipStatus.CANCELLED ||
        current.status === MembershipStatus.EXPIRED ||
        current.status === MembershipStatus.TRANSFERRED
      ) {
        throw new BadRequestException(
          `Cannot cancel membership in status ${current.status}`,
        );
      }

      current.status = MembershipStatus.CANCELLED;
      current.freeze = undefined;
      await current.save({ session });
      const event = await this.appendEvent(
        {
          membershipId: current._id,
          type: MembershipEventType.CANCELLED,
          actor,
          reason: dto.reason,
        },
        session,
      );
      await this.enqueueMembershipEvent(event, current, session);
      return current;
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
    session?: ClientSession,
  ) {
    if (!session) {
      return this.transactions.run((transactionSession) =>
        this.consumeCreditInSession(
          membershipId,
          dto,
          actor,
          clubId,
          transactionSession,
        ),
      );
    }
    return this.consumeCreditInSession(
      membershipId,
      dto,
      actor,
      clubId,
      session,
    );
  }

  private async consumeCreditInSession(
    membershipId: string,
    dto: ConsumeMembershipCreditDto,
    actor: ActorRef,
    clubId: string | undefined,
    session: ClientSession,
  ) {
    const membership = await this.findMembershipOrFail(
      membershipId,
      clubId,
      session,
    );
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
      await membership.save({ session });
      const event = await this.appendEvent(
        {
          membershipId: membership._id,
          type: MembershipEventType.EXPIRED,
          actor: { kind: MembershipActorKind.SYSTEM },
        },
        session,
      );
      await this.enqueueMembershipEvent(event, membership, session);
      throw new BadRequestException('Membership has expired');
    }

    const plan = await this.planModel
      .findById(membership.planId)
      .session(session);
    const amount = dto.amount ?? 1;
    const kind =
      dto.creditKind ??
      (plan?.kind === MembershipPlanKind.ENTRIES
        ? MembershipPlanKind.ENTRIES
        : MembershipPlanKind.SESSIONS);

    if (
      kind !== MembershipPlanKind.ENTRIES &&
      kind !== MembershipPlanKind.SESSIONS
    ) {
      throw new BadRequestException(
        'Duration memberships do not consume session/entry credit',
      );
    }

    const creditField =
      kind === MembershipPlanKind.ENTRIES
        ? 'credit.remainingEntries'
        : 'credit.remainingSessions';
    const updated = await this.membershipModel.findOneAndUpdate(
      {
        _id: membership._id,
        status: MembershipStatus.ACTIVE,
        [creditField]: { $gte: amount },
      },
      { $inc: { [creditField]: -amount } },
      { new: true, session },
    );
    if (!updated) {
      throw new BadRequestException(
        kind === MembershipPlanKind.ENTRIES
          ? 'Insufficient entry credit'
          : 'Insufficient session credit',
      );
    }

    const event = await this.appendEvent(
      {
        membershipId: updated._id,
        type: MembershipEventType.CREDIT_CONSUMED,
        actor,
        reason: dto.reason,
        payload: { creditKind: kind, amount },
      },
      session,
    );
    await this.enqueueMembershipEvent(event, updated, session, {
      creditKind: kind,
      amount,
    });

    return this.toMembershipPublic(updated);
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

    await this.assertPlatformEntitlementConfiguration(dto);
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
      entitlementContract: dto.entitlementContract,
      planVersion: 1,
      contractReady: dto.contractReady ?? false,
      postExpirationMode: dto.postExpirationMode,
      fallbackPlanId: dto.fallbackPlanId
        ? new Types.ObjectId(dto.fallbackPlanId)
        : undefined,
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

    await this.assertPlatformEntitlementConfiguration({
      entitlementContract: dto.entitlementContract ?? plan.entitlementContract,
      contractReady: dto.contractReady ?? plan.contractReady,
      postExpirationMode: dto.postExpirationMode ?? plan.postExpirationMode,
      fallbackPlanId: dto.fallbackPlanId ?? plan.fallbackPlanId?.toString(),
    });

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
    if (dto.entitlementContract !== undefined) {
      plan.entitlementContract = dto.entitlementContract;
      plan.planVersion = (plan.planVersion ?? 1) + 1;
    }
    if (dto.contractReady !== undefined) plan.contractReady = dto.contractReady;
    if (dto.postExpirationMode !== undefined) {
      plan.postExpirationMode = dto.postExpirationMode;
    }
    if (dto.fallbackPlanId !== undefined) {
      plan.fallbackPlanId = new Types.ObjectId(dto.fallbackPlanId);
    }
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
      items.map((subscription) => this.toPlatformSubPublic(subscription)),
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
    if (plan.pricing.amount > 0) {
      throw new BadRequestException(
        'Paid platform plans require verified gateway checkout',
      );
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
      if (
        plan.pricing.amount === 0 &&
        active.planId.toString() === plan._id.toString()
      ) {
        return this.toPlatformSubPublic(active);
      }
      throw new BadRequestException(
        'User already has an active platform subscription',
      );
    }

    const start = new Date();
    const periodDays = plan.pricing.periodDays ?? 30;
    const end = new Date(start.getTime() + periodDays * 24 * 60 * 60 * 1000);

    const sub = await this.transactions.run(async (session) => {
      const created = new this.platformSubModel({
        userId: new Types.ObjectId(userId),
        currentEntitlementKey: 'current',
        planId: plan._id,
        status: PlatformSubscriptionStatus.ACTIVE,
        period: { start, end },
        renewal: {
          mode: dto.renewal?.mode ?? SubscriptionRenewalMode.MANUAL,
        },
        entitlementSnapshot: plan.entitlementContract,
        planVersion: plan.planVersion ?? 1,
        postExpirationModeSnapshot: plan.postExpirationMode,
        fallbackPlanIdSnapshot: plan.fallbackPlanId,
        graceEndsAt: new Date(
          end.getTime() +
            (plan.entitlementContract?.graceDays ?? 7) * 86_400_000,
        ),
      });
      await created.save({ session });
      await this.outbox.enqueue(
        {
          eventName: 'platform_subscription.activated',
          idempotencyKey: `platform-subscription-free:${created._id.toString()}`,
          payload: {
            subscriptionId: created._id.toString(),
            planId: plan._id.toString(),
            userId,
            paymentId: null,
          },
        },
        session,
      );
      return created;
    });

    this.audit.log({
      action: AuditAction.PLATFORM_SUBSCRIPTION_ACTIVATED,
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
    const result = await this.transactions.run(async (session) => {
      const sub = await this.platformSubModel
        .findById(subscriptionId)
        .session(session);
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
      if (sub.cancellationRequestedAt) {
        return { sub, idempotent: true };
      }

      // ADR-0001: disable renewal but retain entitlement until period end.
      sub.renewal = { mode: SubscriptionRenewalMode.MANUAL };
      sub.cancellationRequestedAt = new Date();
      sub.cancellationReason = dto.reason;
      await sub.save({ session });
      await this.outbox.enqueue(
        {
          eventName: 'platform_subscription.cancellation_requested',
          idempotencyKey: `platform-subscription-cancel:${sub._id.toString()}:${sub.period.end.toISOString()}`,
          payload: {
            subscriptionId: sub._id.toString(),
            userId,
            effectiveAt: sub.period.end.toISOString(),
            reason: dto.reason,
          },
        },
        session,
      );
      return { sub, idempotent: false };
    });

    if (!result.idempotent) {
      this.audit.log({
        action: AuditAction.PLATFORM_SUBSCRIPTION_CANCELLATION_REQUESTED,
        actorId: userId,
        targetUserId: userId,
        metadata: {
          scope: 'platform',
          subscriptionId: result.sub._id.toString(),
          effectiveAt: result.sub.period.end,
          reason: dto.reason,
        },
        request,
      });
    }

    return this.toPlatformSubPublic(result.sub);
  }

  async listMyPlatformSubscriptions(userId: string) {
    const items = await this.platformSubModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
    return {
      result: items.map((s) => this.toPlatformSubPublic(s)),
    };
  }

  async schedulePlatformPlanChange(
    userId: string,
    subscriptionId: string,
    dto: SchedulePlatformPlanChangeDto,
    request?: Request,
  ) {
    if (!Types.ObjectId.isValid(subscriptionId)) {
      throw new NotFoundException('Subscription not found');
    }
    const target = await this.findPlatformPlanOrFail(dto.planId);
    if (
      target.status !== EntityStatus.ACTIVE ||
      !target.contractReady ||
      !target.entitlementContract
    ) {
      throw new BadRequestException(
        'Target platform plan is not ready for entitlement enforcement',
      );
    }
    const updated = await this.transactions.run(async (session) => {
      const subscription = await this.platformSubModel
        .findOne({
          _id: new Types.ObjectId(subscriptionId),
          userId: new Types.ObjectId(userId),
          currentEntitlementKey: 'current',
          status: {
            $in: [
              PlatformSubscriptionStatus.ACTIVE,
              PlatformSubscriptionStatus.TRIALING,
              PlatformSubscriptionStatus.PAST_DUE,
            ],
          },
        })
        .session(session);
      if (!subscription) throw new NotFoundException('Subscription not found');
      const currentPlan = await this.platformPlanModel
        .findById(subscription.planId)
        .session(session);
      if (!currentPlan) throw new NotFoundException('Current plan not found');
      if (
        currentPlan.entitlementContract?.audience !==
        target.entitlementContract?.audience
      ) {
        throw new BadRequestException('Plan audience cannot be changed');
      }
      if (target.pricing.amount >= currentPlan.pricing.amount) {
        throw new BadRequestException(
          'Same-plan renewal and upgrades require checkout preview',
        );
      }
      if (subscription.scheduledPlanId?.toString() === dto.planId) {
        return subscription;
      }
      subscription.scheduledPlanId = target._id;
      subscription.scheduledPlanEffectiveAt = subscription.period.end;
      await subscription.save({ session });
      await this.outbox.enqueue(
        {
          eventName: 'platform_subscription.plan_change_scheduled',
          idempotencyKey: `platform-subscription-plan-change:${subscription._id.toString()}:${target._id.toString()}:${subscription.period.end.toISOString()}`,
          payload: {
            subscriptionId: subscription._id.toString(),
            userId,
            currentPlanId: currentPlan._id.toString(),
            targetPlanId: target._id.toString(),
            effectiveAt: subscription.period.end.toISOString(),
          },
        },
        session,
      );
      return subscription;
    });
    this.audit.log({
      action: AuditAction.PLATFORM_SUBSCRIPTION_UPDATED,
      actorId: userId,
      targetUserId: userId,
      metadata: {
        scope: 'platform',
        subscriptionId,
        scheduledPlanId: dto.planId,
      },
      request,
    });
    return this.toPlatformSubPublic(updated);
  }

  /** Subscriber-facing catalog: active plans only. */
  async listActivePlatformPlans() {
    const items = await this.platformPlanModel
      .find({ status: EntityStatus.ACTIVE })
      .sort({ 'pricing.amount': 1 });
    return { result: items.map((p) => this.toPlatformPlanPublic(p)) };
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
      userId: holder.userId ? new Types.ObjectId(holder.userId) : undefined,
      guest: holder.guest
        ? { name: holder.guest.name, phone: holder.guest.phone }
        : undefined,
    };
  }

  private async findClubOrFail(clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(clubId);
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  private async findPlanOrFail(
    clubId: string,
    planId: string,
    session?: ClientSession,
  ) {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException('Membership plan not found');
    }
    const plan = await this.planModel
      .findOne({
        _id: new Types.ObjectId(planId),
        clubId: new Types.ObjectId(clubId),
      })
      .session(session ?? null);
    if (!plan) throw new NotFoundException('Membership plan not found');
    return plan;
  }

  private async findSellablePlan(
    clubId: string,
    planId: string,
    session?: ClientSession,
  ) {
    const plan = await this.findPlanOrFail(clubId, planId, session);
    if (plan.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException('Membership plan is not active');
    }
    return plan;
  }

  private async findMembershipOrFail(
    membershipId: string,
    clubId?: string,
    session?: ClientSession,
  ) {
    if (!Types.ObjectId.isValid(membershipId)) {
      throw new NotFoundException('Membership not found');
    }
    const filter: QueryFilter<ClubMembershipDocument> = {
      _id: new Types.ObjectId(membershipId),
    };
    if (clubId) filter.clubId = new Types.ObjectId(clubId);

    const membership = await this.membershipModel
      .findOne(filter)
      .session(session ?? null);
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

  private async appendEvent(
    input: {
      membershipId: Types.ObjectId;
      type: MembershipEventType;
      actor: { userId?: string; kind: MembershipActorKind };
      reason?: string;
      payload?: Record<string, unknown>;
    },
    session?: ClientSession,
  ) {
    const event = new this.eventModel({
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
    await event.save({ session });
    return event;
  }

  private async enqueueMembershipEvent(
    event: MembershipEventDocument,
    membership: ClubMembershipDocument,
    session: ClientSession,
    extra: Record<string, unknown> = {},
  ) {
    await this.outbox.enqueue(
      {
        eventName: `membership.${event.type}`,
        idempotencyKey: `membership-event:${event._id.toString()}`,
        payload: {
          membershipId: membership._id.toString(),
          clubId: membership.clubId.toString(),
          planId: membership.planId.toString(),
          holderUserId: membership.holder.userId?.toString(),
          ...extra,
        },
      },
      session,
    );
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

  /** Batch-enrich memberships with club/plan names and holder display name. */
  private async toMembershipPublicMany(items: ClubMembershipDocument[]) {
    if (items.length === 0) return [];

    const planIds = [...new Set(items.map((m) => m.planId.toString()))].map(
      (id) => new Types.ObjectId(id),
    );
    const clubIds = [...new Set(items.map((m) => m.clubId.toString()))].map(
      (id) => new Types.ObjectId(id),
    );
    const userIds = [
      ...new Set(
        items
          .map((m) => m.holder.userId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ].map((id) => new Types.ObjectId(id));

    type UserLite = {
      _id: Types.ObjectId;
      name?: { first?: string; last?: string };
      phone?: string;
    };

    const [plans, clubs, users] = await Promise.all([
      this.planModel.find({ _id: { $in: planIds } }).lean(),
      this.clubModel.find({ _id: { $in: clubIds } }).lean(),
      userIds.length
        ? (this.userModel
            .find({ _id: { $in: userIds } })
            .select({ name: 1, phone: 1 })
            .lean() as Promise<UserLite[]>)
        : Promise.resolve([] as UserLite[]),
    ]);

    const planById = new Map(plans.map((p) => [p._id.toString(), p]));
    const clubById = new Map(clubs.map((c) => [c._id.toString(), c]));
    const userById = new Map(users.map((u) => [u._id.toString(), u]));

    return items.map((m) => {
      const base = this.toMembershipPublic(m);
      const plan = planById.get(m.planId.toString());
      const club = clubById.get(m.clubId.toString());
      const user = m.holder.userId
        ? userById.get(m.holder.userId.toString())
        : undefined;
      const holderName = m.holder.guest?.name
        ? m.holder.guest.name
        : [user?.name?.first, user?.name?.last]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          user?.phone ||
          undefined;

      return {
        ...base,
        clubName: club?.identity?.name,
        planName: plan?.name,
        planKind: plan?.kind,
        sessionsTotal: plan?.sessionsTotal,
        entriesTotal: plan?.entriesTotal,
        durationDays: plan?.durationDays,
        pricing: plan
          ? {
              amount: plan.pricing.amount,
              tax: plan.pricing.tax,
              currency: plan.pricing.currency,
            }
          : undefined,
        holder: {
          ...base.holder,
          displayName: holderName,
        },
      };
    });
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
      entitlementContract: plan.entitlementContract ?? null,
      planVersion: plan.planVersion ?? 1,
      contractReady: plan.contractReady ?? false,
      postExpirationMode: plan.postExpirationMode ?? null,
      fallbackPlanId: plan.fallbackPlanId?.toString() ?? null,
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
      entitlementSnapshot: sub.entitlementSnapshot ?? null,
      planVersion: sub.planVersion ?? null,
      postExpirationModeSnapshot: sub.postExpirationModeSnapshot ?? null,
      fallbackPlanIdSnapshot: sub.fallbackPlanIdSnapshot?.toString() ?? null,
      graceEndsAt: sub.graceEndsAt ?? null,
      scheduledPlanId: sub.scheduledPlanId?.toString() ?? null,
      scheduledPlanEffectiveAt: sub.scheduledPlanEffectiveAt ?? null,
      cancellationRequestedAt: sub.cancellationRequestedAt ?? null,
      cancellationReason: sub.cancellationReason ?? null,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  private async assertPlatformEntitlementConfiguration(input: {
    entitlementContract?: {
      schemaVersion: 1;
      audience: 'club_owner' | 'coach';
      capabilities: string[];
      limits: Array<{
        key: string;
        value: number | null;
        mode: 'hard' | 'soft';
      }>;
      graceDays: number;
    };
    contractReady?: boolean;
    postExpirationMode?: 'free_plan' | 'read_only';
    fallbackPlanId?: string;
  }) {
    const contract = input.entitlementContract;
    if (input.contractReady && (!contract || !input.postExpirationMode)) {
      throw new BadRequestException(
        'Contract-ready plans require entitlement contract and expiration mode',
      );
    }
    if (!contract) return;
    const keys = contract.limits.map((limit) => limit.key);
    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('Duplicate platform entitlement limit key');
    }
    const ownerKeys = new Set([
      'clubs.active',
      'staff.active_per_club',
      'members.active_per_club',
      'monthly_messages.transactional',
    ]);
    const incompatible = keys.some((key) =>
      contract.audience === 'club_owner'
        ? !ownerKeys.has(key)
        : ownerKeys.has(key),
    );
    if (incompatible) {
      throw new BadRequestException(
        'Entitlement limit key is incompatible with plan audience',
      );
    }
    if (input.postExpirationMode === 'free_plan') {
      if (
        !input.fallbackPlanId ||
        !Types.ObjectId.isValid(input.fallbackPlanId)
      ) {
        throw new BadRequestException(
          'Free-plan expiration mode requires a fallback plan',
        );
      }
      const fallback = await this.platformPlanModel.findById(
        input.fallbackPlanId,
      );
      if (
        !fallback ||
        fallback.pricing.amount !== 0 ||
        fallback.entitlementContract?.audience !== contract.audience
      ) {
        throw new BadRequestException(
          'Fallback plan must be free and match entitlement audience',
        );
      }
    }
  }
}
