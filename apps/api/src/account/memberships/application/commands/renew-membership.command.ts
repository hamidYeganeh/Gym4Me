import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
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
import type {
  PreviewMembershipRenewalDto,
  RenewMembershipDto,
} from '../../dto/membership.dto';

const RENEWAL_CONSENT_VERSION = 'membership-renewal-v1' as const;
const DAY_MS = 86_400_000;

export type RenewMembershipActor = {
  userId: string;
  kind: MembershipActorKind;
};

type RenewalCredit = {
  remainingSessions?: number;
  remainingEntries?: number;
  expiresAt?: Date;
};

@Injectable()
export class RenewMembershipCommand {
  constructor(
    @InjectModel(ClubMembership.name)
    private readonly membershipModel: Model<ClubMembershipDocument>,
    @InjectModel(ClubMembershipPlan.name)
    private readonly planModel: Model<ClubMembershipPlanDocument>,
    @InjectModel(MembershipEvent.name)
    private readonly eventModel: Model<MembershipEventDocument>,
    private readonly finance: FinanceService,
    private readonly coupons: CouponsService,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
  ) {}

  async preview(
    clubId: string,
    membershipId: string,
    dto: PreviewMembershipRenewalDto,
  ) {
    const { membership, plan } = await this.loadContext(clubId, membershipId);
    return this.buildPreview(membership, plan, dto.couponCode);
  }

  async execute(
    clubId: string,
    membershipId: string,
    dto: RenewMembershipDto,
    actor: RenewMembershipActor,
    request?: Request,
  ) {
    const replay = await this.findReplay(membershipId, dto.idempotencyKey);
    if (replay) return this.resolveReplay(replay, dto.previewFingerprint);

    let committed: Awaited<ReturnType<RenewMembershipCommand['commit']>>;
    try {
      committed = await this.transactions.run((session) =>
        this.commit(clubId, membershipId, dto, actor, session),
      );
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        const winner = await this.findReplay(membershipId, dto.idempotencyKey);
        if (winner) {
          return this.resolveReplay(winner, dto.previewFingerprint);
        }
      }
      throw error;
    }

    if (committed.idempotent) {
      return this.resolveReplay(committed.event, dto.previewFingerprint);
    }
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
      action: AuditAction.MEMBERSHIP_RENEWED,
      actorId: actor.userId,
      targetUserId: committed.membership.holder.userId?.toString(),
      metadata: {
        membershipId,
        clubId,
        planId: committed.membership.planId.toString(),
        paymentId: committed.paymentId,
        debtId: committed.debtId,
        consentVersion: dto.consentVersion,
      },
      request,
    });
    return this.toResult(committed.membership, committed.preview);
  }

  private async commit(
    clubId: string,
    membershipId: string,
    dto: RenewMembershipDto,
    actor: RenewMembershipActor,
    session: ClientSession,
  ) {
    const replay = await this.findReplay(
      membershipId,
      dto.idempotencyKey,
      session,
    );
    if (replay) {
      return {
        idempotent: true as const,
        event: replay,
        membership: null,
        preview: null,
        paymentId: undefined,
        debtId: undefined,
        paymentDto: undefined,
        paymentResult: undefined,
      };
    }

    const { membership, plan } = await this.loadContext(
      clubId,
      membershipId,
      session,
    );
    const preview = await this.buildPreview(membership, plan, dto.couponCode);
    if (preview.previewFingerprint !== dto.previewFingerprint) {
      throw new ConflictException(
        'Membership renewal preview changed; review the latest price and credit effect',
      );
    }
    if (
      dto.channel === PaymentChannel.ZARINPAL ||
      dto.channel === PaymentChannel.WALLET
    ) {
      throw new BadRequestException(
        'Desk renewal requires cash, POS, card-to-card or mixed payment',
      );
    }

    const payable = preview.price.payable;
    const collected = dto.paidAmount ?? payable;
    if (collected > payable) {
      throw new BadRequestException(
        'paidAmount cannot exceed the renewal payable amount',
      );
    }

    let discount = preview.price.discount;
    if (dto.couponCode) {
      const redeemed = await this.coupons.redeem(
        dto.couponCode,
        {
          userId: membership.holder.userId?.toString(),
          clubId,
          amount: preview.price.gross,
          contextKey: `membership-renewal:${membershipId}:${dto.idempotencyKey}`,
        },
        session,
      );
      if (redeemed.discount !== discount) {
        throw new ConflictException(
          'Membership renewal discount changed; request a new preview',
        );
      }
      discount = redeemed.discount;
    }

    let paymentId: string | undefined;
    let debtId: string | undefined;
    let paymentDto: Parameters<FinanceService['recordPayment']>[0] | undefined;
    let paymentResult:
      Awaited<ReturnType<FinanceService['recordPayment']>> | undefined;
    if (collected > 0) {
      const channel = dto.channel ?? PaymentChannel.CASH;
      paymentDto = {
        purpose: PaymentPurpose.MEMBERSHIP,
        channel,
        status: PaymentStatus.CAPTURED,
        amount:
          collected === payable
            ? {
                gross: preview.price.gross,
                discount,
                tax: preview.price.tax,
              }
            : { gross: collected },
        reference: {
          orderId: `mem_renew_${membershipId}`,
          externalRef: dto.externalRef,
        },
        payer: {
          userId: membership.holder.userId?.toString(),
          guest: membership.holder.guest
            ? {
                name: membership.holder.guest.name,
                phone: membership.holder.guest.phone,
              }
            : undefined,
        },
        tenders: dto.tenders,
        related: { membershipId, clubId },
        idempotencyKey: `membership-renewal:${membershipId}:${dto.idempotencyKey}`,
        operatorNote: `Membership renewal by ${actor.userId}`,
      };
      paymentResult = await this.finance.recordPayment(paymentDto, {
        actorId: actor.userId,
        operatorUserId: actor.userId,
        request: undefined,
        session,
      });
      paymentId = paymentResult.payment._id.toString();
    }

    const outstanding = payable - collected;
    if (outstanding > 0) {
      const defaultDueAt = new Date();
      defaultDueAt.setDate(defaultDueAt.getDate() + 30);
      const created = await this.finance.createDebt(
        clubId,
        {
          holder: {
            userId: membership.holder.userId?.toString(),
            guest: membership.holder.guest
              ? {
                  name: membership.holder.guest.name,
                  phone: membership.holder.guest.phone,
                }
              : undefined,
          },
          membershipId,
          principal: outstanding,
          dueAt: dto.debt?.dueAt ?? defaultDueAt.toISOString(),
          installmentCount: dto.debt?.installmentCount,
          note: dto.debt?.note ?? `Outstanding renewal balance ${membershipId}`,
        },
        session,
      );
      debtId = created.debt._id.toString();
    }

    const previousStatus = membership.status;
    const previousCredit = this.creditPublic(membership.credit);
    membership.status = MembershipStatus.ACTIVE;
    membership.freeze = undefined;
    membership.credit = preview.renewedCredit;
    if (paymentId) membership.paymentId = new Types.ObjectId(paymentId);
    await membership.save({ session });

    const event = new this.eventModel({
      membershipId: membership._id,
      type: MembershipEventType.RENEWED,
      actor: {
        userId: new Types.ObjectId(actor.userId),
        kind: actor.kind,
      },
      payload: {
        planId: plan._id.toString(),
        previousStatus,
        previousCredit,
        renewedCredit: this.creditPublic(preview.renewedCredit),
        price: preview.price,
        paymentId,
        debtId,
        consentVersion: dto.consentVersion,
      },
      occurredAt: new Date(),
      idempotencyKey: dto.idempotencyKey,
      requestFingerprint: dto.previewFingerprint,
    });
    await event.save({ session });
    await this.outbox.enqueue(
      {
        eventName: 'membership.renewed',
        idempotencyKey: `membership-event:${event._id.toString()}`,
        payload: {
          membershipId,
          clubId,
          planId: plan._id.toString(),
          holderUserId: membership.holder.userId?.toString(),
          paymentId,
          debtId,
        },
      },
      session,
    );

    return {
      idempotent: false as const,
      event,
      membership,
      preview,
      paymentId,
      debtId,
      paymentDto,
      paymentResult,
    };
  }

  private async loadContext(
    clubId: string,
    membershipId: string,
    session?: ClientSession,
  ) {
    if (
      !Types.ObjectId.isValid(clubId) ||
      !Types.ObjectId.isValid(membershipId)
    ) {
      throw new NotFoundException('Membership not found');
    }
    const membershipQuery = this.membershipModel.findOne({
      _id: new Types.ObjectId(membershipId),
      clubId: new Types.ObjectId(clubId),
    });
    if (session) membershipQuery.session(session);
    const membership = await membershipQuery;
    if (!membership) throw new NotFoundException('Membership not found');
    if (
      membership.status === MembershipStatus.CANCELLED ||
      membership.status === MembershipStatus.TRANSFERRED
    ) {
      throw new BadRequestException(
        `Cannot renew membership in status ${membership.status}`,
      );
    }
    const planQuery = this.planModel.findOne({
      _id: membership.planId,
      clubId: membership.clubId,
      status: EntityStatus.ACTIVE,
    });
    if (session) planQuery.session(session);
    const plan = await planQuery;
    if (!plan) throw new NotFoundException('Active membership plan not found');
    return { membership, plan };
  }

  private async buildPreview(
    membership: ClubMembershipDocument,
    plan: ClubMembershipPlanDocument,
    couponCode?: string,
  ) {
    const gross = plan.pricing.amount;
    const coupon = couponCode
      ? await this.coupons.preview(couponCode, {
          userId: membership.holder.userId?.toString(),
          clubId: membership.clubId.toString(),
          amount: gross,
        })
      : null;
    const discount = coupon?.discount ?? 0;
    const renewedCredit = this.buildRenewedCredit(membership, plan);
    const price = {
      gross,
      discount,
      tax: plan.pricing.tax ?? 0,
      payable: Math.max(0, gross - discount),
      currency: plan.pricing.currency ?? 'IRT',
    };
    const fingerprintPayload = {
      membershipId: membership._id.toString(),
      planId: plan._id.toString(),
      planUpdatedAt: plan.updatedAt?.toISOString() ?? null,
      consentVersion: RENEWAL_CONSENT_VERSION,
      couponCode: coupon?.code ?? null,
      price,
      currentCredit: this.creditPublic(membership.credit),
      renewedCredit: this.creditPublic(renewedCredit),
    };
    const previewFingerprint = createHash('sha256')
      .update(JSON.stringify(fingerprintPayload))
      .digest('hex');
    return {
      previewFingerprint,
      consentVersion: RENEWAL_CONSENT_VERSION,
      membershipId: membership._id.toString(),
      plan: {
        id: plan._id.toString(),
        name: plan.name,
        kind: plan.kind,
      },
      price,
      currentCredit: this.creditPublic(membership.credit),
      renewedCredit,
    };
  }

  private buildRenewedCredit(
    membership: ClubMembershipDocument,
    plan: ClubMembershipPlanDocument,
  ): RenewalCredit {
    if (plan.kind === MembershipPlanKind.DURATION) {
      const currentExpiry = membership.credit?.expiresAt
        ? new Date(membership.credit.expiresAt).getTime()
        : 0;
      const base = Math.max(Date.now(), currentExpiry);
      return {
        expiresAt: new Date(base + (plan.durationDays ?? 30) * DAY_MS),
      };
    }
    if (plan.kind === MembershipPlanKind.SESSIONS) {
      return {
        remainingSessions:
          (membership.credit?.remainingSessions ?? 0) +
          (plan.sessionsTotal ?? 0),
      };
    }
    return {
      remainingEntries:
        (membership.credit?.remainingEntries ?? 0) + (plan.entriesTotal ?? 0),
    };
  }

  private creditPublic(credit: RenewalCredit | undefined) {
    return {
      remainingSessions: credit?.remainingSessions,
      remainingEntries: credit?.remainingEntries,
      expiresAt: credit?.expiresAt
        ? new Date(credit.expiresAt).toISOString()
        : undefined,
    };
  }

  private findReplay(
    membershipId: string,
    idempotencyKey: string,
    session?: ClientSession,
  ) {
    if (!Types.ObjectId.isValid(membershipId)) return null;
    const query = this.eventModel.findOne({
      membershipId: new Types.ObjectId(membershipId),
      type: MembershipEventType.RENEWED,
      idempotencyKey,
    });
    return session ? query.session(session) : query;
  }

  private async resolveReplay(
    event: MembershipEventDocument,
    fingerprint: string,
  ) {
    if (event.requestFingerprint !== fingerprint) {
      throw new ConflictException(
        'Renewal idempotency key was already used with a different preview',
      );
    }
    const membership = await this.membershipModel.findById(event.membershipId);
    if (!membership) throw new NotFoundException('Membership not found');
    return {
      membership: this.membershipPublic(membership),
      renewal: event.payload ?? null,
      idempotent: true,
    };
  }

  private toResult(
    membership: ClubMembershipDocument,
    preview: Awaited<ReturnType<RenewMembershipCommand['buildPreview']>>,
  ) {
    return {
      membership: this.membershipPublic(membership),
      renewal: {
        previewFingerprint: preview.previewFingerprint,
        consentVersion: preview.consentVersion,
        price: preview.price,
        renewedCredit: this.creditPublic(preview.renewedCredit),
      },
      idempotent: false,
    };
  }

  private membershipPublic(membership: ClubMembershipDocument) {
    return {
      id: membership._id.toString(),
      clubId: membership.clubId.toString(),
      planId: membership.planId.toString(),
      holder: {
        userId: membership.holder.userId?.toString(),
        guest: membership.holder.guest
          ? {
              name: membership.holder.guest.name,
              phone: membership.holder.guest.phone,
            }
          : undefined,
      },
      status: membership.status,
      credit: this.creditPublic(membership.credit),
      paymentId: membership.paymentId?.toString(),
      createdAt: membership.createdAt.toISOString(),
      updatedAt: membership.updatedAt.toISOString(),
    };
  }
}
