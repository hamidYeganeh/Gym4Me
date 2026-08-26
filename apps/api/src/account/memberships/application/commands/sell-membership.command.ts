import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types, type ClientSession } from 'mongoose';
import { AuditService } from '../../../../audit/audit.service';
import {
  AuditAction,
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { CouponsService } from '../../../../coupons/coupons.service';
import { FinanceService } from '../../../../finance/finance.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import {
  ClubMembership,
  type ClubMembershipDocument,
} from '../../../../schemas/club-membership.schema';
import {
  ClubMembershipPlan,
  type ClubMembershipPlanDocument,
} from '../../../../schemas/club-membership-plan.schema';
import {
  MembershipEvent,
  type MembershipEventDocument,
} from '../../../../schemas/membership-event.schema';
import type { SellMembershipDto } from '../../dto/membership.dto';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import { PlatformEntitlementService } from '../services/platform-entitlement.service';

export type SellMembershipActor = {
  userId: string;
  kind: MembershipActorKind;
};

export type SellMembershipOptions = {
  skipPayment?: boolean;
  importSource?: { batchKey: string; rowKey: string };
};

type NormalizedHolder = {
  userId?: Types.ObjectId;
  guest?: { name: string; phone: string };
};

/** Atomically sell a membership with its money, debt and event records. */
@Injectable()
export class SellMembershipCommand {
  constructor(
    @InjectModel(ClubMembershipPlan.name)
    private readonly planModel: Model<ClubMembershipPlanDocument>,
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(MembershipEvent.name)
    private readonly eventModel: Model<MembershipEventDocument>,
    private readonly audit: AuditService,
    private readonly finance: FinanceService,
    private readonly coupons: CouponsService,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly entitlements: PlatformEntitlementService,
  ) {}

  async execute(
    clubId: string,
    dto: SellMembershipDto,
    actor: SellMembershipActor,
    request?: Request,
    options?: SellMembershipOptions,
  ): Promise<ClubMembershipDocument> {
    const existing = await this.findIdempotentMembership(clubId, dto);
    if (existing) return existing;

    const club = await this.clubModel.findById(clubId).select({ ownerId: 1 });
    if (!club) throw new NotFoundException('Club not found');
    const holder = this.normalizeHolder(dto.holder);
    let committed: Awaited<ReturnType<SellMembershipCommand['commit']>>;
    try {
      committed = await this.transactions.run((session) =>
        this.commit(
          clubId,
          club.ownerId.toString(),
          dto,
          actor,
          holder,
          options,
          session,
        ),
      );
    } catch (error) {
      if (dto.idempotencyKey && (error as { code?: number }).code === 11000) {
        const winningReplay = await this.findIdempotentMembership(clubId, dto);
        if (winningReplay) return winningReplay;
      }
      throw error;
    }

    if (committed.idempotent) return committed.membership;

    if (committed.paymentDto && committed.paymentResult) {
      await this.finance.runPaymentPostCommitEffects(
        committed.paymentDto,
        {
          actorId: actor.userId,
          operatorUserId: actor.userId,
          request,
        },
        committed.paymentResult,
      );
    }

    this.audit.log({
      action: AuditAction.MEMBERSHIP_SOLD,
      actorId: actor.userId,
      targetUserId: holder.userId?.toString(),
      metadata: {
        clubId,
        membershipId: committed.membership._id.toString(),
        planId: committed.plan?._id.toString(),
        paymentId: committed.paymentId,
        debtId: committed.debtId,
      },
      request,
    });
    return committed.membership;
  }

  private async commit(
    clubId: string,
    ownerId: string,
    dto: SellMembershipDto,
    actor: SellMembershipActor,
    holder: NormalizedHolder,
    options: SellMembershipOptions | undefined,
    session: ClientSession,
  ) {
    const existing = await this.findIdempotentMembership(clubId, dto, session);
    if (existing) {
      return {
        membership: existing,
        plan: null,
        paymentId: existing.paymentId?.toString(),
        debtId: undefined,
        paymentDto: undefined,
        paymentResult: undefined,
        idempotent: true as const,
      };
    }

    await this.entitlements.serializeAndAssertIncrement({
      userId: ownerId,
      clubId,
      key: 'members.active_per_club',
      session,
    });

    const plan = await this.findSellablePlan(clubId, dto.planId, session);
    const gross = plan.pricing?.amount ?? 0;
    this.assertTrustedPaymentPath(dto, actor, gross, options);
    const membership = new this.membershipModel({
      clubId: new Types.ObjectId(clubId),
      planId: plan._id,
      holder,
      status: MembershipStatus.ACTIVE,
      credit: this.buildCreditFromPlan(plan),
      soldBy: new Types.ObjectId(actor.userId),
      paymentId: dto.paymentId ? new Types.ObjectId(dto.paymentId) : undefined,
      idempotencyKey: dto.idempotencyKey,
      importSource: options?.importSource,
    });
    await membership.save({ session });

    let paymentId = dto.paymentId;
    let debtId: string | undefined;
    let paymentDto: Parameters<FinanceService['recordPayment']>[0] | undefined;
    let paymentResult:
      Awaited<ReturnType<FinanceService['recordPayment']>> | undefined;
    if (!paymentId && gross > 0 && !options?.skipPayment) {
      const channel = dto.channel ?? PaymentChannel.CASH;
      const idempotencyKey =
        dto.idempotencyKey ??
        `membership-sell:${clubId}:${plan._id.toString()}:${membership._id.toString()}`;
      let discount = 0;
      if (dto.couponCode) {
        const redeemed = await this.coupons.redeem(
          dto.couponCode,
          {
            userId: holder.userId?.toString(),
            clubId,
            amount: gross,
            contextKey: `membership:${membership._id.toString()}`,
          },
          session,
        );
        discount = redeemed.discount;
      }

      const payable = Math.max(0, gross - discount);
      const collected = dto.paidAmount ?? payable;
      if (collected > payable) {
        throw new BadRequestException(
          'paidAmount cannot exceed the membership payable amount',
        );
      }

      if (collected > 0) {
        const isFullPayment = collected === payable;
        paymentDto = {
          purpose: PaymentPurpose.MEMBERSHIP,
          channel,
          status: PaymentStatus.CAPTURED,
          amount: isFullPayment
            ? {
                gross,
                discount,
                tax: plan.pricing?.tax ?? 0,
              }
            : { gross: collected },
          reference: {
            orderId: `mem_${membership._id.toString()}`,
            externalRef: dto.externalRef,
          },
          payer: {
            userId: holder.userId?.toString(),
            guest: holder.guest
              ? { name: holder.guest.name, phone: holder.guest.phone }
              : undefined,
          },
          tenders: dto.tenders,
          related: {
            membershipId: membership._id.toString(),
            clubId,
          },
          idempotencyKey,
          operatorNote: `Desk/self membership sell by ${actor.userId}`,
        };
        paymentResult = await this.finance.recordPayment(paymentDto, {
          actorId: actor.userId,
          operatorUserId: actor.userId,
          request: undefined,
          session,
        });
        paymentId = paymentResult.payment._id.toString();
        membership.paymentId = new Types.ObjectId(paymentId);
        await membership.save({ session });
      }

      const outstanding = payable - collected;
      if (outstanding > 0) {
        const defaultDueAt = new Date();
        defaultDueAt.setDate(defaultDueAt.getDate() + 30);
        const created = await this.finance.createDebt(
          clubId,
          {
            holder: {
              userId: holder.userId?.toString(),
              guest: holder.guest,
            },
            membershipId: membership._id.toString(),
            principal: outstanding,
            dueAt: dto.debt?.dueAt ?? defaultDueAt.toISOString(),
            installmentCount: dto.debt?.installmentCount,
            note:
              dto.debt?.note ??
              `Outstanding membership balance ${membership._id.toString()}`,
          },
          session,
        );
        debtId = created.debt._id.toString();
      }
    }

    const event = await this.appendSoldEvent(
      membership,
      plan,
      clubId,
      actor,
      paymentId,
      debtId,
      options,
      session,
    );
    await this.outbox.enqueue(
      {
        eventName: 'membership.sold',
        idempotencyKey: `membership-event:${event._id.toString()}`,
        payload: {
          membershipId: membership._id.toString(),
          clubId,
          planId: plan._id.toString(),
          holderUserId: holder.userId?.toString(),
          paymentId,
          debtId,
        },
      },
      session,
    );
    return {
      membership,
      plan,
      paymentId,
      debtId,
      paymentDto,
      paymentResult,
      idempotent: false as const,
    };
  }

  private assertTrustedPaymentPath(
    dto: SellMembershipDto,
    actor: SellMembershipActor,
    gross: number,
    options?: SellMembershipOptions,
  ): void {
    if (dto.paymentId) {
      throw new BadRequestException(
        'Externally supplied membership paymentId is not accepted',
      );
    }
    if (gross <= 0 || options?.skipPayment) return;
    if (actor.kind === MembershipActorKind.ATHLETE) {
      throw new BadRequestException(
        'Online membership checkout requires a verified payment intent',
      );
    }
    if (
      dto.channel === PaymentChannel.ZARINPAL ||
      dto.channel === PaymentChannel.WALLET
    ) {
      throw new BadRequestException(
        'Desk sale requires cash, POS, card-to-card or mixed payment',
      );
    }
  }

  private async findIdempotentMembership(
    clubId: string,
    dto: SellMembershipDto,
    session?: ClientSession,
  ): Promise<ClubMembershipDocument | null> {
    if (!dto.idempotencyKey) return null;
    const query = this.membershipModel.findOne({
      clubId: new Types.ObjectId(clubId),
      idempotencyKey: dto.idempotencyKey,
    });
    return session ? query.session(session) : query;
  }

  private normalizeHolder(
    holder: SellMembershipDto['holder'],
  ): NormalizedHolder {
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

  private async findSellablePlan(
    clubId: string,
    planId: string,
    session: ClientSession,
  ): Promise<ClubMembershipPlanDocument> {
    if (!Types.ObjectId.isValid(planId)) {
      throw new NotFoundException('Membership plan not found');
    }
    const plan = await this.planModel
      .findOne({
        _id: new Types.ObjectId(planId),
        clubId: new Types.ObjectId(clubId),
      })
      .session(session);
    if (!plan) throw new NotFoundException('Membership plan not found');
    if (plan.status !== EntityStatus.ACTIVE) {
      throw new BadRequestException('Membership plan is not active');
    }
    return plan;
  }

  private buildCreditFromPlan(plan: ClubMembershipPlanDocument) {
    if (plan.kind === MembershipPlanKind.DURATION) {
      const days = plan.durationDays ?? 30;
      return {
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      };
    }
    if (plan.kind === MembershipPlanKind.SESSIONS) {
      return { remainingSessions: plan.sessionsTotal };
    }
    if (plan.kind === MembershipPlanKind.ENTRIES) {
      return { remainingEntries: plan.entriesTotal };
    }
    return {};
  }

  private async appendSoldEvent(
    membership: ClubMembershipDocument,
    plan: ClubMembershipPlanDocument,
    clubId: string,
    actor: SellMembershipActor,
    paymentId: string | undefined,
    debtId: string | undefined,
    options: SellMembershipOptions | undefined,
    session: ClientSession,
  ): Promise<MembershipEventDocument> {
    const event = new this.eventModel({
      membershipId: membership._id,
      type: MembershipEventType.SOLD,
      actor: {
        userId: new Types.ObjectId(actor.userId),
        kind: actor.kind,
      },
      payload: {
        planId: plan._id.toString(),
        clubId,
        paymentId,
        debtId,
        importSource: options?.importSource,
      },
      occurredAt: new Date(),
    });
    await event.save({ session });
    return event;
  }
}
