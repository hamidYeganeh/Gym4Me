import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { Model, Types, type ClientSession } from 'mongoose';
import { AuditService } from '../../../../audit/audit.service';
import {
  AuditAction,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
  PublishStatus,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { PaymentGatewayService } from '../../../../common/payment/payment-gateway.service';
import { assertAllowedPaymentCallbackUrl } from '../../../../common/payment/payment-callback-url.policy';
import { FinanceService } from '../../../../finance/finance.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import {
  ClubMembership,
  type ClubMembershipDocument,
} from '../../../../schemas/club-membership.schema';
import {
  ClubMembershipPlan,
  type ClubMembershipPlanDocument,
} from '../../../../schemas/club-membership-plan.schema';
import {
  MembershipCheckout,
  MembershipCheckoutMode,
  MembershipCheckoutStatus,
  type MembershipCheckoutDocument,
} from '../../../../schemas/membership-checkout.schema';
import {
  MembershipEvent,
  type MembershipEventDocument,
} from '../../../../schemas/membership-event.schema';
import {
  Payment,
  type PaymentDocument,
} from '../../../../schemas/payment.schema';
import type {
  InitiateMembershipCheckoutDto,
  PreviewMembershipCheckoutDto,
  VerifyMembershipCheckoutDto,
} from '../../dto/membership.dto';
import { RenewMembershipCommand } from '../commands/renew-membership.command';
import { PlatformEntitlementService } from './platform-entitlement.service';

const PURCHASE_CONSENT_VERSION = 'membership-checkout-v1';
const RENEWAL_CONSENT_VERSION = 'membership-renewal-v1';
const CHECKOUT_TTL_MS = 30 * 60_000;
const INITIATION_LEASE_MS = 60_000;

@Injectable()
export class MembershipCheckoutService {
  constructor(
    @InjectModel(MembershipCheckout.name)
    private readonly checkouts: Model<MembershipCheckoutDocument>,
    @InjectModel(Payment.name)
    private readonly payments: Model<PaymentDocument>,
    @InjectModel(Club.name)
    private readonly clubs: Model<ClubDocument>,
    @InjectModel(ClubMembership.name)
    private readonly memberships: Model<ClubMembershipDocument>,
    @InjectModel(ClubMembershipPlan.name)
    private readonly plans: Model<ClubMembershipPlanDocument>,
    @InjectModel(MembershipEvent.name)
    private readonly events: Model<MembershipEventDocument>,
    private readonly renewals: RenewMembershipCommand,
    private readonly gateway: PaymentGatewayService,
    private readonly finance: FinanceService,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
    private readonly entitlements: PlatformEntitlementService,
  ) {}

  async preview(userId: string, dto: PreviewMembershipCheckoutDto) {
    const snapshot = await this.buildSnapshot(
      userId,
      {
        ...dto,
        idempotencyKey: 'preview-only',
        previewFingerprint: '0'.repeat(64),
        consentVersion: dto.membershipId
          ? RENEWAL_CONSENT_VERSION
          : PURCHASE_CONSENT_VERSION,
        consentAccepted: true,
        callbackUrl: 'https://preview.invalid',
      },
      true,
    );
    return {
      mode: snapshot.mode,
      fingerprint: snapshot.fingerprint,
      consentVersion: dto.membershipId
        ? RENEWAL_CONSENT_VERSION
        : PURCHASE_CONSENT_VERSION,
      plan: {
        id: dto.planId,
        name: snapshot.planName,
        kind: snapshot.planKind,
      },
      price: snapshot.price,
      currentCredit: snapshot.currentCredit,
      resultingCredit: snapshot.resultingCredit,
    };
  }

  async initiate(userId: string, dto: InitiateMembershipCheckoutDto) {
    const replay = await this.checkouts.findOne({
      userId: new Types.ObjectId(userId),
      idempotencyKey: dto.idempotencyKey,
    });
    if (replay) {
      this.assertReplay(replay, dto);
      return this.ensureGatewayInitiated(replay, dto.callbackUrl);
    }

    const snapshot = await this.buildSnapshot(userId, dto);
    if (snapshot.price.payable <= 0) {
      throw new BadRequestException(
        'Free membership plans do not require gateway checkout',
      );
    }
    let checkout: MembershipCheckoutDocument;
    try {
      checkout = await this.transactions.run(async (session) => {
        const created = new this.checkouts({
          userId: new Types.ObjectId(userId),
          clubId: new Types.ObjectId(dto.clubId),
          planId: new Types.ObjectId(dto.planId),
          membershipId: dto.membershipId
            ? new Types.ObjectId(dto.membershipId)
            : undefined,
          mode: snapshot.mode,
          planKind: snapshot.planKind,
          planName: snapshot.planName,
          price: snapshot.price,
          currentCredit: snapshot.currentCredit,
          resultingCredit: snapshot.resultingCredit,
          creditGrant: snapshot.creditGrant,
          fingerprint: snapshot.fingerprint,
          consentVersion: dto.consentVersion,
          idempotencyKey: dto.idempotencyKey,
          status: MembershipCheckoutStatus.PENDING,
          expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
        });
        await created.save({ session });
        const paymentDto = this.paymentDto(created);
        const payment = await this.finance.recordPayment(paymentDto, {
          actorId: userId,
          session,
        });
        created.paymentId = payment.payment._id;
        await created.save({ session });
        return created;
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        const winner = await this.checkouts.findOne({
          userId: new Types.ObjectId(userId),
          idempotencyKey: dto.idempotencyKey,
        });
        if (winner) {
          this.assertReplay(winner, dto);
          return this.ensureGatewayInitiated(winner, dto.callbackUrl);
        }
      }
      throw error;
    }
    return this.ensureGatewayInitiated(checkout, dto.callbackUrl);
  }

  async verify(
    userId: string,
    checkoutId: string,
    dto: VerifyMembershipCheckoutDto,
    request?: Request,
  ) {
    const checkout = await this.findOwned(userId, checkoutId);
    if (checkout.status === MembershipCheckoutStatus.COMPLETED) {
      if (checkout.authority !== dto.authority) {
        throw new BadRequestException('Unknown payment authority');
      }
      return this.result(checkout, true);
    }
    this.assertPending(checkout, dto.authority, true);
    if (dto.status === 'NOK') {
      await this.cancel(checkout);
      return this.result(checkout, false);
    }

    const verified = await this.gateway.verifyPayment({
      authority: dto.authority,
      amount: checkout.price.payable * 10,
    });
    if (!verified.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verified.message}`,
      );
    }

    const committed = await this.transactions.run((session) =>
      this.commitVerified(
        userId,
        checkoutId,
        dto.authority,
        verified.refId,
        session,
      ),
    );
    if (!committed.idempotent) {
      await this.finance.runPaymentPostCommitEffects(
        this.paymentDto(committed.checkout, verified.refId),
        { actorId: userId, request },
        committed.payment,
      );
      this.audit.log({
        action:
          committed.checkout.mode === MembershipCheckoutMode.RENEWAL
            ? AuditAction.MEMBERSHIP_RENEWED
            : AuditAction.MEMBERSHIP_SOLD,
        actorId: userId,
        targetUserId: userId,
        metadata: {
          checkoutId,
          membershipId: committed.membership._id.toString(),
          paymentId: committed.checkout.paymentId?.toString(),
          planId: committed.checkout.planId.toString(),
          mode: committed.checkout.mode,
        },
        request,
      });
    }
    return this.result(
      committed.checkout,
      committed.idempotent,
      committed.membership,
    );
  }

  async reconcilePending(limit = 100) {
    const now = new Date();
    const candidates = await this.checkouts
      .find({
        status: MembershipCheckoutStatus.PENDING,
        authority: { $exists: true },
        updatedAt: { $lte: new Date(now.getTime() - 2 * 60_000) },
        $or: [
          { lastReconciliationAt: { $exists: false } },
          {
            lastReconciliationAt: {
              $lte: new Date(now.getTime() - 10 * 60_000),
            },
          },
        ],
      })
      .sort({ updatedAt: 1 })
      .limit(limit);
    let captured = 0;
    let unresolved = 0;
    for (const checkout of candidates) {
      if (!checkout.authority) continue;
      try {
        await this.verify(checkout.userId.toString(), checkout._id.toString(), {
          authority: checkout.authority,
          status: 'OK',
        });
        captured += 1;
      } catch (error) {
        unresolved += 1;
        await this.checkouts.updateOne(
          {
            _id: checkout._id,
            status: MembershipCheckoutStatus.PENDING,
          },
          {
            $inc: { reconciliationAttempts: 1 },
            $set: {
              lastReconciliationAt: now,
              lastReconciliationError:
                error instanceof Error ? error.message : String(error),
            },
          },
        );
      }
    }
    const expired = await this.checkouts
      .find({
        status: MembershipCheckoutStatus.PENDING,
        expiresAt: { $lte: now },
        authority: { $exists: false },
      })
      .limit(Math.max(0, limit - candidates.length));
    for (const checkout of expired) {
      await this.transactions.run(async (session) => {
        const current = await this.checkouts
          .findOne({
            _id: checkout._id,
            status: MembershipCheckoutStatus.PENDING,
            expiresAt: { $lte: now },
            authority: { $exists: false },
          })
          .session(session);
        if (!current) return;
        current.status = MembershipCheckoutStatus.EXPIRED;
        await current.save({ session });
        await this.payments.updateOne(
          { _id: current.paymentId, status: PaymentStatus.PENDING },
          { $set: { status: PaymentStatus.CANCELLED, cancelledAt: now } },
          { session },
        );
      });
    }
    return {
      scanned: candidates.length,
      captured,
      unresolved,
      expired: expired.length,
    };
  }

  private async buildSnapshot(
    userId: string,
    dto: InitiateMembershipCheckoutDto,
    previewOnly = false,
  ) {
    const club = await this.clubs.findOne({
      _id: new Types.ObjectId(dto.clubId),
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });
    if (!club) throw new NotFoundException('Club not found');
    const plan = await this.plans.findOne({
      _id: new Types.ObjectId(dto.planId),
      clubId: new Types.ObjectId(dto.clubId),
      status: EntityStatus.ACTIVE,
      publishStatus: PublishStatus.PUBLISHED,
    });
    if (!plan) {
      throw new NotFoundException('Published membership plan not found');
    }

    if (dto.membershipId) {
      if (dto.consentVersion !== RENEWAL_CONSENT_VERSION) {
        throw new BadRequestException('Unsupported renewal consent version');
      }
      const membership = await this.memberships.findOne({
        _id: new Types.ObjectId(dto.membershipId),
        clubId: new Types.ObjectId(dto.clubId),
        planId: plan._id,
        'holder.userId': new Types.ObjectId(userId),
      });
      if (!membership) throw new NotFoundException('Membership not found');
      const preview = await this.renewals.preview(
        dto.clubId,
        dto.membershipId,
        {},
      );
      if (
        !previewOnly &&
        dto.previewFingerprint !== preview.previewFingerprint
      ) {
        throw new ConflictException('Renewal preview changed');
      }
      return {
        mode: MembershipCheckoutMode.RENEWAL,
        planKind: plan.kind,
        planName: plan.name,
        price: preview.price,
        currentCredit: preview.currentCredit,
        resultingCredit: preview.renewedCredit,
        creditGrant: this.grantFromPlan(plan),
        fingerprint: preview.previewFingerprint,
      };
    }

    if (dto.consentVersion !== PURCHASE_CONSENT_VERSION) {
      throw new BadRequestException('Unsupported checkout consent version');
    }
    const resultingCredit = this.creditFromPlan(plan);
    const price = {
      gross: plan.pricing.amount,
      discount: 0,
      tax: plan.pricing.tax ?? 0,
      payable: plan.pricing.amount,
      currency: plan.pricing.currency ?? 'IRT',
    };
    const fingerprint = this.purchaseFingerprint(plan, price, resultingCredit);
    if (!previewOnly && dto.previewFingerprint !== fingerprint) {
      throw new ConflictException('Membership checkout preview changed');
    }
    return {
      mode: MembershipCheckoutMode.PURCHASE,
      planKind: plan.kind,
      planName: plan.name,
      price,
      currentCredit: {},
      resultingCredit,
      creditGrant: this.grantFromPlan(plan),
      fingerprint,
    };
  }

  private async ensureGatewayInitiated(
    checkout: MembershipCheckoutDocument,
    callbackUrl: string,
  ) {
    if (checkout.authority && checkout.redirectUrl) {
      return this.initiation(checkout, true);
    }
    this.assertPending(checkout);
    const claimId = randomUUID();
    const now = new Date();
    const claimed = await this.checkouts.findOneAndUpdate(
      {
        _id: checkout._id,
        status: MembershipCheckoutStatus.PENDING,
        authority: { $exists: false },
        $or: [
          { initiationClaimedAt: { $exists: false } },
          {
            initiationClaimedAt: {
              $lte: new Date(now.getTime() - INITIATION_LEASE_MS),
            },
          },
        ],
      },
      { $set: { initiationClaimId: claimId, initiationClaimedAt: now } },
      { new: true },
    );
    if (!claimed) {
      const raced = await this.checkouts.findById(checkout._id);
      if (raced?.authority && raced.redirectUrl) {
        return this.initiation(raced, true);
      }
      throw new ConflictException('Checkout initiation is in progress');
    }
    try {
      const callback = new URL(assertAllowedPaymentCallbackUrl(callbackUrl));
      callback.searchParams.set('checkoutId', claimed._id.toString());
      const gateway = await this.gateway.createPayment({
        amount: claimed.price.payable * 10,
        description: `${claimed.planName} - Gym4Me`,
        callbackUrl: callback.toString(),
        orderId: `membership-checkout:${claimed._id.toString()}`,
      });
      const initiated = await this.checkouts.findOneAndUpdate(
        { _id: claimed._id, initiationClaimId: claimId },
        {
          $set: {
            authority: gateway.authority,
            redirectUrl: gateway.redirectUrl,
          },
          $unset: { initiationClaimId: 1, initiationClaimedAt: 1 },
        },
        { new: true },
      );
      if (!initiated) {
        throw new ConflictException('Checkout initiation lease was lost');
      }
      await this.payments.updateOne(
        { _id: initiated.paymentId, status: PaymentStatus.PENDING },
        {
          $set: {
            'reference.authority': gateway.authority,
            'reference.redirectUrl': gateway.redirectUrl,
            'reference.initiatedAt': new Date(),
          },
        },
      );
      return this.initiation(initiated, false);
    } catch (error) {
      await this.checkouts.updateOne(
        { _id: claimed._id, initiationClaimId: claimId },
        { $unset: { initiationClaimId: 1, initiationClaimedAt: 1 } },
      );
      throw error;
    }
  }

  private async commitVerified(
    userId: string,
    checkoutId: string,
    authority: string,
    gatewayRefId: string,
    session: ClientSession,
  ) {
    const checkout = await this.checkouts
      .findOne({
        _id: new Types.ObjectId(checkoutId),
        userId: new Types.ObjectId(userId),
      })
      .session(session);
    if (!checkout) throw new NotFoundException('Membership checkout not found');
    if (checkout.status === MembershipCheckoutStatus.COMPLETED) {
      const membership = await this.memberships
        .findById(checkout.membershipId)
        .session(session);
      if (!membership) throw new NotFoundException('Membership not found');
      const payment = await this.finance.capturePendingGatewayPayment(
        {
          paymentId: checkout.paymentId!,
          authority,
          gatewayRefId,
          membershipId: membership._id,
        },
        session,
      );
      return { checkout, membership, payment, idempotent: true as const };
    }
    this.assertPending(checkout, authority, true);

    let membership: ClubMembershipDocument;
    if (checkout.mode === MembershipCheckoutMode.RENEWAL) {
      const current = await this.memberships
        .findOne({
          _id: checkout.membershipId,
          clubId: checkout.clubId,
          planId: checkout.planId,
          'holder.userId': checkout.userId,
          status: {
            $nin: [MembershipStatus.CANCELLED, MembershipStatus.TRANSFERRED],
          },
        })
        .session(session);
      if (!current) {
        throw new ConflictException('Membership can no longer be renewed');
      }
      current.status = MembershipStatus.ACTIVE;
      current.freeze = undefined;
      current.credit = this.applyGrant(current.credit, checkout.creditGrant);
      membership = current;
    } else {
      const club = await this.clubs.findById(checkout.clubId).session(session);
      if (!club) throw new NotFoundException('Club not found');
      await this.entitlements.serializeAndAssertIncrement({
        userId: club.ownerId.toString(),
        clubId: checkout.clubId.toString(),
        key: 'members.active_per_club',
        session,
      });
      membership = new this.memberships({
        clubId: checkout.clubId,
        planId: checkout.planId,
        holder: { userId: checkout.userId },
        status: MembershipStatus.ACTIVE,
        credit: this.applyGrant(undefined, checkout.creditGrant),
        soldBy: checkout.userId,
        idempotencyKey: `online-checkout:${checkout._id.toString()}`,
      });
    }
    membership.paymentId = checkout.paymentId;
    await membership.save({ session });

    const payment = await this.finance.capturePendingGatewayPayment(
      {
        paymentId: checkout.paymentId!,
        authority,
        gatewayRefId,
        membershipId: membership._id,
      },
      session,
    );
    const event = new this.events({
      membershipId: membership._id,
      type:
        checkout.mode === MembershipCheckoutMode.RENEWAL
          ? MembershipEventType.RENEWED
          : MembershipEventType.SOLD,
      actor: { userId: checkout.userId, kind: MembershipActorKind.ATHLETE },
      payload: {
        checkoutId: checkout._id.toString(),
        planId: checkout.planId.toString(),
        price: checkout.price,
        resultingCredit: checkout.resultingCredit,
        paymentId: checkout.paymentId?.toString(),
        consentVersion: checkout.consentVersion,
      },
      occurredAt: new Date(),
      idempotencyKey: `checkout:${checkout._id.toString()}`,
      requestFingerprint: checkout.fingerprint,
    });
    await event.save({ session });
    await this.outbox.enqueue(
      {
        eventName:
          checkout.mode === MembershipCheckoutMode.RENEWAL
            ? 'membership.renewed'
            : 'membership.sold',
        idempotencyKey: `membership-checkout:${checkout._id.toString()}`,
        payload: {
          checkoutId: checkout._id.toString(),
          membershipId: membership._id.toString(),
          clubId: checkout.clubId.toString(),
          planId: checkout.planId.toString(),
          holderUserId: userId,
          paymentId: checkout.paymentId?.toString(),
        },
      },
      session,
    );
    checkout.membershipId = membership._id;
    checkout.gatewayRefId = gatewayRefId;
    checkout.status = MembershipCheckoutStatus.COMPLETED;
    checkout.completedAt = new Date();
    await checkout.save({ session });
    return { checkout, membership, payment, idempotent: false as const };
  }

  private paymentDto(
    checkout: MembershipCheckoutDocument,
    gatewayRefId?: string,
  ) {
    return {
      purpose: PaymentPurpose.MEMBERSHIP,
      channel: PaymentChannel.ZARINPAL,
      status: gatewayRefId ? PaymentStatus.CAPTURED : PaymentStatus.PENDING,
      amount: {
        gross: checkout.price.gross,
        discount: checkout.price.discount,
        tax: checkout.price.tax,
      },
      reference: {
        orderId: `membership-checkout:${checkout._id.toString()}`,
        authority: checkout.authority,
        gatewayRefId,
      },
      payer: { userId: checkout.userId.toString() },
      related: {
        clubId: checkout.clubId.toString(),
        membershipId: checkout.membershipId?.toString(),
        membershipPlanId: checkout.planId.toString(),
      },
      idempotencyKey: `membership-checkout:${checkout._id.toString()}`,
    };
  }

  private creditFromPlan(plan: ClubMembershipPlanDocument) {
    if (plan.kind === MembershipPlanKind.DURATION) {
      return {
        expiresAt: new Date(
          Date.now() + (plan.durationDays ?? 30) * 86_400_000,
        ),
      };
    }
    if (plan.kind === MembershipPlanKind.SESSIONS) {
      return { remainingSessions: plan.sessionsTotal ?? 0 };
    }
    return { remainingEntries: plan.entriesTotal ?? 0 };
  }

  private grantFromPlan(plan: ClubMembershipPlanDocument) {
    if (plan.kind === MembershipPlanKind.DURATION) {
      return { durationDays: plan.durationDays ?? 30 };
    }
    if (plan.kind === MembershipPlanKind.SESSIONS) {
      return { sessions: plan.sessionsTotal ?? 0 };
    }
    return { entries: plan.entriesTotal ?? 0 };
  }

  private applyGrant(
    credit:
      | {
          remainingSessions?: number;
          remainingEntries?: number;
          expiresAt?: Date;
        }
      | undefined,
    grant: {
      durationDays?: number;
      sessions?: number;
      entries?: number;
    },
  ) {
    if (grant.durationDays) {
      const currentExpiry = credit?.expiresAt
        ? new Date(credit.expiresAt).getTime()
        : 0;
      return {
        expiresAt: new Date(
          Math.max(Date.now(), currentExpiry) + grant.durationDays * 86_400_000,
        ),
      };
    }
    if (grant.sessions) {
      return {
        remainingSessions: (credit?.remainingSessions ?? 0) + grant.sessions,
      };
    }
    return {
      remainingEntries: (credit?.remainingEntries ?? 0) + (grant.entries ?? 0),
    };
  }

  private purchaseFingerprint(
    plan: ClubMembershipPlanDocument,
    price: Record<string, unknown>,
    credit: Record<string, unknown>,
  ) {
    return createHash('sha256')
      .update(
        JSON.stringify({
          planId: plan._id.toString(),
          planUpdatedAt: plan.updatedAt?.toISOString() ?? null,
          consentVersion: PURCHASE_CONSENT_VERSION,
          price,
          credit: this.creditPublic(credit),
        }),
      )
      .digest('hex');
  }

  private creditPublic(credit: Record<string, unknown>) {
    return {
      remainingSessions: credit.remainingSessions,
      remainingEntries: credit.remainingEntries,
      expiresAt:
        credit.expiresAt instanceof Date
          ? credit.expiresAt.toISOString()
          : credit.expiresAt,
    };
  }

  private assertReplay(
    checkout: MembershipCheckoutDocument,
    dto: InitiateMembershipCheckoutDto,
  ) {
    if (
      checkout.clubId.toString() !== dto.clubId ||
      checkout.planId.toString() !== dto.planId ||
      checkout.membershipId?.toString() !== dto.membershipId ||
      checkout.consentVersion !== dto.consentVersion ||
      checkout.fingerprint !== dto.previewFingerprint
    ) {
      throw new ConflictException(
        'Checkout idempotency key has different semantics',
      );
    }
  }

  private assertPending(
    checkout: MembershipCheckoutDocument,
    authority?: string,
    allowExpired = false,
  ) {
    if (checkout.status !== MembershipCheckoutStatus.PENDING) {
      throw new ConflictException('Membership checkout is not pending');
    }
    if (!allowExpired && checkout.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException('Membership checkout expired');
    }
    if (authority && checkout.authority !== authority) {
      throw new BadRequestException('Unknown payment authority');
    }
  }

  private async findOwned(userId: string, checkoutId: string) {
    if (!Types.ObjectId.isValid(checkoutId)) {
      throw new NotFoundException('Membership checkout not found');
    }
    const checkout = await this.checkouts.findOne({
      _id: new Types.ObjectId(checkoutId),
      userId: new Types.ObjectId(userId),
    });
    if (!checkout) {
      throw new NotFoundException('Membership checkout not found');
    }
    return checkout;
  }

  private async cancel(checkout: MembershipCheckoutDocument) {
    checkout.status = MembershipCheckoutStatus.CANCELLED;
    checkout.cancelledAt = new Date();
    await checkout.save();
    await this.payments.updateOne(
      { _id: checkout.paymentId, status: PaymentStatus.PENDING },
      { $set: { status: PaymentStatus.CANCELLED, cancelledAt: new Date() } },
    );
  }

  private initiation(
    checkout: MembershipCheckoutDocument,
    idempotent: boolean,
  ) {
    return {
      checkoutId: checkout._id.toString(),
      mode: checkout.mode,
      fingerprint: checkout.fingerprint,
      consentVersion: checkout.consentVersion,
      price: checkout.price,
      resultingCredit: this.creditPublic(
        checkout.resultingCredit as unknown as Record<string, unknown>,
      ),
      authority: checkout.authority,
      redirectUrl: checkout.redirectUrl,
      expiresAt: checkout.expiresAt.toISOString(),
      idempotent,
    };
  }

  private async result(
    checkout: MembershipCheckoutDocument,
    idempotent: boolean,
    membership?: ClubMembershipDocument,
  ) {
    const resolved =
      membership ??
      (checkout.membershipId
        ? await this.memberships.findById(checkout.membershipId)
        : null);
    return {
      checkoutId: checkout._id.toString(),
      status: checkout.status,
      membershipId:
        resolved?._id.toString() ?? checkout.membershipId?.toString(),
      paymentId: checkout.paymentId?.toString(),
      idempotent,
    };
  }
}
