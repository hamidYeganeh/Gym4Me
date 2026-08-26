import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { Model, Types, type ClientSession } from 'mongoose';
import { AuditService } from '../../../../audit/audit.service';
import {
  AuditAction,
  PaymentStatus,
  PlatformSubscriptionStatus,
  SubscriptionRenewalMode,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { assertAllowedPaymentCallbackUrl } from '../../../../common/payment/payment-callback-url.policy';
import { PaymentGatewayService } from '../../../../common/payment/payment-gateway.service';
import { FinanceService } from '../../../../finance/finance.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import {
  Payment,
  type PaymentDocument,
} from '../../../../schemas/payment.schema';
import {
  PlatformSubscriptionCheckout,
  PlatformSubscriptionCheckoutStatus,
  type PlatformSubscriptionCheckoutDocument,
} from '../../../../schemas/platform-subscription-checkout.schema';
import {
  PlatformSubscription,
  type PlatformSubscriptionDocument,
} from '../../../../schemas/platform-subscription.schema';
import type {
  InitiatePlatformSubscriptionCheckoutDto,
  PreviewPlatformSubscriptionCheckoutDto,
  VerifyPlatformSubscriptionCheckoutDto,
} from '../../dto/membership.dto';
import {
  PLATFORM_SUBSCRIPTION_CONSENT_VERSION,
  PlatformSubscriptionCheckoutPolicy,
} from '../policies/platform-subscription-checkout.policy';

const CHECKOUT_TTL_MS = 30 * 60_000;
const INITIATION_LEASE_MS = 60_000;

@Injectable()
export class PlatformSubscriptionCheckoutService {
  constructor(
    @InjectModel(PlatformSubscriptionCheckout.name)
    private readonly checkouts: Model<PlatformSubscriptionCheckoutDocument>,
    @InjectModel(Payment.name)
    private readonly payments: Model<PaymentDocument>,
    @InjectModel(PlatformSubscription.name)
    private readonly subscriptions: Model<PlatformSubscriptionDocument>,
    private readonly policy: PlatformSubscriptionCheckoutPolicy,
    private readonly gateway: PaymentGatewayService,
    private readonly finance: FinanceService,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
    private readonly audit: AuditService,
  ) {}

  async preview(userId: string, dto: PreviewPlatformSubscriptionCheckoutDto) {
    const snapshot = await this.policy.buildSnapshot(userId, dto);
    return {
      fingerprint: snapshot.fingerprint,
      consentVersion: PLATFORM_SUBSCRIPTION_CONSENT_VERSION,
      plan: {
        id: snapshot.plan._id.toString(),
        name: snapshot.plan.name,
        periodDays: snapshot.periodDays,
      },
      price: snapshot.price,
      changeKind: snapshot.changeKind,
      currentSubscriptionId: snapshot.current?._id.toString(),
      priceReferenceAt: snapshot.referenceAt.toISOString(),
      proration: {
        previousNetPrice: snapshot.previousNetPrice,
        remainingSeconds: snapshot.remainingSeconds,
        credit: snapshot.price.credit,
        roundingPolicy: snapshot.roundingPolicy,
      },
      entitlementSnapshot: snapshot.plan.entitlementContract ?? null,
      planVersion: snapshot.plan.planVersion ?? 1,
      renewalMode: dto.renewalMode ?? SubscriptionRenewalMode.MANUAL,
    };
  }

  async initiate(userId: string, dto: InitiatePlatformSubscriptionCheckoutDto) {
    const replay = await this.checkouts.findOne({
      userId: new Types.ObjectId(userId),
      idempotencyKey: dto.idempotencyKey,
    });
    if (replay) {
      this.policy.assertReplay(replay, dto);
      if (replay.price.payable === 0) {
        return this.completeZeroPayable(userId, replay, dto.callbackUrl);
      }
      return this.ensureGatewayInitiated(replay, dto.callbackUrl);
    }

    const referenceAt = dto.priceReferenceAt
      ? new Date(dto.priceReferenceAt)
      : new Date();
    const referenceAgeMs = Date.now() - referenceAt.getTime();
    if (referenceAgeMs < -30_000 || referenceAgeMs > 5 * 60_000) {
      throw new ConflictException('Platform subscription preview expired');
    }
    const snapshot = await this.policy.buildSnapshot(userId, dto, referenceAt);
    if (snapshot.price.payable <= 0 && snapshot.changeKind === 'initial') {
      throw new BadRequestException(
        'Free platform plans do not require checkout',
      );
    }
    if (dto.consentVersion !== PLATFORM_SUBSCRIPTION_CONSENT_VERSION) {
      throw new BadRequestException('Unsupported subscription consent version');
    }
    if (dto.previewFingerprint !== snapshot.fingerprint) {
      throw new ConflictException('Platform subscription preview changed');
    }

    let checkout: PlatformSubscriptionCheckoutDocument;
    try {
      checkout = await this.transactions.run(async (session) => {
        const created = new this.checkouts({
          userId: new Types.ObjectId(userId),
          planId: snapshot.plan._id,
          subscriptionId: snapshot.current?._id,
          planName: snapshot.plan.name,
          periodDays: snapshot.periodDays,
          renewalMode: dto.renewalMode ?? SubscriptionRenewalMode.MANUAL,
          price: snapshot.price,
          entitlementSnapshot: snapshot.plan.entitlementContract,
          planVersion: snapshot.plan.planVersion ?? 1,
          postExpirationModeSnapshot: snapshot.plan.postExpirationMode,
          fallbackPlanIdSnapshot: snapshot.plan.fallbackPlanId,
          changeKind: snapshot.changeKind,
          previousPlanId: snapshot.currentPlan?._id,
          previousPeriodStart: snapshot.previousPeriodStart,
          previousPeriodEnd: snapshot.previousPeriodEnd,
          previousSubscriptionVersion: snapshot.previousSubscriptionVersion,
          priceReferenceAt: snapshot.referenceAt,
          previousNetPrice: snapshot.previousNetPrice,
          remainingSeconds: snapshot.remainingSeconds,
          roundingPolicy: snapshot.roundingPolicy,
          fingerprint: snapshot.fingerprint,
          consentVersion: dto.consentVersion,
          idempotencyKey: dto.idempotencyKey,
          status: PlatformSubscriptionCheckoutStatus.PENDING,
          expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
        });
        await created.save({ session });
        if (created.price.payable > 0) {
          const payment = await this.finance.recordPayment(
            this.policy.paymentDto(created),
            { actorId: userId, session },
          );
          created.paymentId = payment.payment._id;
        }
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
          this.policy.assertReplay(winner, dto);
          return this.ensureGatewayInitiated(winner, dto.callbackUrl);
        }
        throw new ConflictException(
          'A subscription checkout is already pending',
        );
      }
      throw error;
    }
    if (checkout.price.payable === 0) {
      return this.completeZeroPayable(userId, checkout, dto.callbackUrl);
    }
    return this.ensureGatewayInitiated(checkout, dto.callbackUrl);
  }

  async verify(
    userId: string,
    checkoutId: string,
    dto: VerifyPlatformSubscriptionCheckoutDto,
    request?: Request,
  ) {
    const checkout = await this.findOwned(userId, checkoutId);
    if (checkout.status === PlatformSubscriptionCheckoutStatus.COMPLETED) {
      if (checkout.authority !== dto.authority) {
        throw new BadRequestException('Unknown payment authority');
      }
      return this.result(checkout, true);
    }
    this.policy.assertPending(checkout, dto.authority, true);
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
        this.policy.paymentDto(committed.checkout, verified.refId),
        { actorId: userId, request },
        committed.payment,
      );
      this.audit.log({
        action: AuditAction.PLATFORM_SUBSCRIPTION_ACTIVATED,
        actorId: userId,
        targetUserId: userId,
        metadata: {
          scope: 'platform',
          checkoutId,
          subscriptionId: committed.subscription._id.toString(),
          paymentId: committed.checkout.paymentId?.toString(),
          planId: committed.checkout.planId.toString(),
        },
        request,
      });
    }
    return this.result(
      committed.checkout,
      committed.idempotent,
      committed.subscription,
    );
  }

  private async ensureGatewayInitiated(
    checkout: PlatformSubscriptionCheckoutDocument,
    callbackUrl: string,
  ) {
    if (checkout.authority && checkout.redirectUrl) {
      return this.initiation(checkout, true);
    }
    this.policy.assertPending(checkout);
    const claimId = randomUUID();
    const now = new Date();
    const claimed = await this.checkouts.findOneAndUpdate(
      {
        _id: checkout._id,
        status: PlatformSubscriptionCheckoutStatus.PENDING,
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
      callback.searchParams.set('platformCheckoutId', claimed._id.toString());
      const gateway = await this.gateway.createPayment({
        amount: claimed.price.payable * 10,
        description: `${claimed.planName} - Gym4Me`,
        callbackUrl: callback.toString(),
        orderId: `platform-subscription-checkout:${claimed._id.toString()}`,
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
    if (!checkout) {
      throw new NotFoundException('Subscription checkout not found');
    }
    if (checkout.status === PlatformSubscriptionCheckoutStatus.COMPLETED) {
      const subscription = await this.subscriptions
        .findById(checkout.subscriptionId)
        .session(session);
      if (!subscription) throw new NotFoundException('Subscription not found');
      const payment = await this.finance.capturePendingGatewayPayment(
        {
          paymentId: checkout.paymentId!,
          authority,
          gatewayRefId,
          platformSubscriptionId: subscription._id,
        },
        session,
      );
      return { checkout, subscription, payment, idempotent: true as const };
    }
    this.policy.assertPending(checkout, authority, true);
    const subscription = await this.applySubscriptionChange(checkout, session);
    const payment = await this.finance.capturePendingGatewayPayment(
      {
        paymentId: checkout.paymentId!,
        authority,
        gatewayRefId,
        platformSubscriptionId: subscription._id,
      },
      session,
    );
    await this.outbox.enqueue(
      {
        eventName: this.subscriptionEventName(checkout.changeKind),
        idempotencyKey: `platform-subscription-checkout:${checkout._id.toString()}`,
        payload: {
          checkoutId: checkout._id.toString(),
          subscriptionId: subscription._id.toString(),
          planId: checkout.planId.toString(),
          userId,
          paymentId: checkout.paymentId?.toString(),
          changeKind: checkout.changeKind ?? 'initial',
          previousPlanId: checkout.previousPlanId?.toString(),
        },
      },
      session,
    );
    checkout.subscriptionId = subscription._id;
    checkout.gatewayRefId = gatewayRefId;
    checkout.status = PlatformSubscriptionCheckoutStatus.COMPLETED;
    checkout.completedAt = new Date();
    await checkout.save({ session });
    return { checkout, subscription, payment, idempotent: false as const };
  }

  private async applySubscriptionChange(
    checkout: PlatformSubscriptionCheckoutDocument,
    session: ClientSession,
  ) {
    const now = new Date();
    const existing = checkout.subscriptionId
      ? await this.subscriptions
          .findById(checkout.subscriptionId)
          .session(session)
      : null;
    if (checkout.changeKind && checkout.changeKind !== 'initial' && !existing) {
      throw new ConflictException('Current platform subscription changed');
    }
    if (existing) {
      if (
        existing.userId.toString() !== checkout.userId.toString() ||
        existing.currentEntitlementKey !== 'current'
      ) {
        throw new ConflictException('Current platform subscription changed');
      }
      if (
        !checkout.previousPlanId ||
        !checkout.previousPeriodStart ||
        !checkout.previousPeriodEnd ||
        checkout.previousSubscriptionVersion === undefined ||
        existing.planId.toString() !== checkout.previousPlanId.toString() ||
        existing.period.start.getTime() !==
          checkout.previousPeriodStart.getTime() ||
        existing.period.end.getTime() !== checkout.previousPeriodEnd.getTime()
      ) {
        throw new ConflictException('Current platform subscription changed');
      }
      const start =
        checkout.changeKind === 'renewal' &&
        existing.period.end.getTime() > now.getTime()
          ? existing.period.end
          : now;
      const end = new Date(start.getTime() + checkout.periodDays * 86_400_000);
      const graceEndsAt = new Date(
        end.getTime() +
          (checkout.entitlementSnapshot?.graceDays ?? 7) * 86_400_000,
      );
      const versionFilter =
        checkout.previousSubscriptionVersion === 0
          ? { $or: [{ __v: 0 }, { __v: { $exists: false } }] }
          : { __v: checkout.previousSubscriptionVersion };
      const updated = await this.subscriptions.findOneAndUpdate(
        {
          _id: existing._id,
          userId: checkout.userId,
          currentEntitlementKey: 'current',
          planId: checkout.previousPlanId,
          'period.start': checkout.previousPeriodStart,
          'period.end': checkout.previousPeriodEnd,
          ...versionFilter,
        },
        {
          $set: {
            planId: checkout.planId,
            status: PlatformSubscriptionStatus.ACTIVE,
            period: { start, end },
            renewal: { mode: checkout.renewalMode },
            entitlementSnapshot: checkout.entitlementSnapshot,
            planVersion: checkout.planVersion,
            postExpirationModeSnapshot: checkout.postExpirationModeSnapshot,
            fallbackPlanIdSnapshot: checkout.fallbackPlanIdSnapshot,
            graceEndsAt,
          },
          $unset: {
            scheduledPlanId: 1,
            scheduledPlanEffectiveAt: 1,
            cancellationRequestedAt: 1,
            cancellationReason: 1,
          },
          $inc: { __v: 1 },
        },
        { new: true, session },
      );
      if (!updated) {
        throw new ConflictException('Current platform subscription changed');
      }
      return updated;
    }

    const current = await this.subscriptions
      .findOne({
        userId: checkout.userId,
        currentEntitlementKey: 'current',
      })
      .session(session);
    if (current) {
      throw new ConflictException(
        'User already has a current platform subscription',
      );
    }
    const start = now;
    const end = new Date(start.getTime() + checkout.periodDays * 86_400_000);
    const subscription = new this.subscriptions({
      userId: checkout.userId,
      currentEntitlementKey: 'current',
      planId: checkout.planId,
      status: PlatformSubscriptionStatus.ACTIVE,
      period: { start, end },
      renewal: { mode: checkout.renewalMode },
      entitlementSnapshot: checkout.entitlementSnapshot,
      planVersion: checkout.planVersion,
      postExpirationModeSnapshot: checkout.postExpirationModeSnapshot,
      fallbackPlanIdSnapshot: checkout.fallbackPlanIdSnapshot,
      graceEndsAt: new Date(
        end.getTime() +
          (checkout.entitlementSnapshot?.graceDays ?? 7) * 86_400_000,
      ),
    });
    await subscription.save({ session });
    checkout.subscriptionId = subscription._id;
    return subscription;
  }

  private async completeZeroPayable(
    userId: string,
    checkout: PlatformSubscriptionCheckoutDocument,
    callbackUrl: string,
  ) {
    const callback = new URL(assertAllowedPaymentCallbackUrl(callbackUrl));
    let idempotent = false;
    const committed = await this.transactions.run(async (session) => {
      const current = await this.checkouts
        .findById(checkout._id)
        .session(session);
      if (!current) {
        throw new NotFoundException('Subscription checkout not found');
      }
      if (current.status === PlatformSubscriptionCheckoutStatus.COMPLETED) {
        idempotent = true;
        return current;
      }
      this.policy.assertPending(current);
      const subscription = await this.applySubscriptionChange(current, session);
      current.subscriptionId = subscription._id;
      current.authority = 'ZERO_PAYABLE';
      current.status = PlatformSubscriptionCheckoutStatus.COMPLETED;
      current.completedAt = new Date();
      callback.searchParams.set('platformCheckoutId', current._id.toString());
      callback.searchParams.set('Authority', 'ZERO_PAYABLE');
      callback.searchParams.set('Status', 'OK');
      current.redirectUrl = callback.toString();
      await current.save({ session });
      await this.outbox.enqueue(
        {
          eventName: this.subscriptionEventName(current.changeKind),
          idempotencyKey: `platform-subscription-checkout:${current._id.toString()}`,
          payload: {
            checkoutId: current._id.toString(),
            subscriptionId: subscription._id.toString(),
            planId: current.planId.toString(),
            userId,
            paymentId: null,
            payable: 0,
          },
        },
        session,
      );
      return current;
    });
    return this.initiation(committed, idempotent);
  }

  private subscriptionEventName(changeKind?: string) {
    switch (changeKind) {
      case 'upgrade':
        return 'platform_subscription.upgraded';
      case 'renewal':
        return 'platform_subscription.renewed';
      default:
        return 'platform_subscription.activated';
    }
  }

  private async findOwned(userId: string, checkoutId: string) {
    if (!Types.ObjectId.isValid(checkoutId)) {
      throw new NotFoundException('Subscription checkout not found');
    }
    const checkout = await this.checkouts.findOne({
      _id: new Types.ObjectId(checkoutId),
      userId: new Types.ObjectId(userId),
    });
    if (!checkout) {
      throw new NotFoundException('Subscription checkout not found');
    }
    return checkout;
  }

  private async cancel(checkout: PlatformSubscriptionCheckoutDocument) {
    const cancelledAt = new Date();
    await this.transactions.run(async (session) => {
      const current = await this.checkouts
        .findOne({
          _id: checkout._id,
          status: PlatformSubscriptionCheckoutStatus.PENDING,
        })
        .session(session);
      if (!current) return;
      current.status = PlatformSubscriptionCheckoutStatus.CANCELLED;
      current.cancelledAt = cancelledAt;
      await current.save({ session });
      await this.payments.updateOne(
        { _id: current.paymentId, status: PaymentStatus.PENDING },
        { $set: { status: PaymentStatus.CANCELLED, cancelledAt } },
        { session },
      );
    });
    checkout.status = PlatformSubscriptionCheckoutStatus.CANCELLED;
    checkout.cancelledAt = cancelledAt;
  }

  private initiation(
    checkout: PlatformSubscriptionCheckoutDocument,
    idempotent: boolean,
  ) {
    return {
      checkoutId: checkout._id.toString(),
      authority: checkout.authority,
      redirectUrl: checkout.redirectUrl,
      expiresAt: checkout.expiresAt.toISOString(),
      idempotent,
    };
  }

  private result(
    checkout: PlatformSubscriptionCheckoutDocument,
    idempotent: boolean,
    subscription?: PlatformSubscriptionDocument,
  ) {
    return {
      checkoutId: checkout._id.toString(),
      status: checkout.status,
      subscriptionId:
        subscription?._id.toString() ?? checkout.subscriptionId?.toString(),
      paymentId: checkout.paymentId?.toString(),
      gatewayRefId: checkout.gatewayRefId,
      idempotent,
    };
  }
}
