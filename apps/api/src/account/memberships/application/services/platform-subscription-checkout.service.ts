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
    await this.policy.assertNoCurrentSubscription(userId);
    const snapshot = await this.policy.buildSnapshot(dto);
    return {
      fingerprint: snapshot.fingerprint,
      consentVersion: PLATFORM_SUBSCRIPTION_CONSENT_VERSION,
      plan: {
        id: snapshot.plan._id.toString(),
        name: snapshot.plan.name,
        periodDays: snapshot.periodDays,
      },
      price: snapshot.price,
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
      return this.ensureGatewayInitiated(replay, dto.callbackUrl);
    }

    await this.policy.assertNoCurrentSubscription(userId);
    const snapshot = await this.policy.buildSnapshot(dto);
    if (snapshot.price.payable <= 0) {
      throw new BadRequestException(
        'Free platform plans do not require gateway checkout',
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
          planName: snapshot.plan.name,
          periodDays: snapshot.periodDays,
          renewalMode: dto.renewalMode ?? SubscriptionRenewalMode.MANUAL,
          price: snapshot.price,
          fingerprint: snapshot.fingerprint,
          consentVersion: dto.consentVersion,
          idempotencyKey: dto.idempotencyKey,
          status: PlatformSubscriptionCheckoutStatus.PENDING,
          expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
        });
        await created.save({ session });
        const payment = await this.finance.recordPayment(
          this.policy.paymentDto(created),
          { actorId: userId, session },
        );
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
          this.policy.assertReplay(winner, dto);
          return this.ensureGatewayInitiated(winner, dto.callbackUrl);
        }
        throw new ConflictException(
          'A subscription checkout is already pending',
        );
      }
      throw error;
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
    const current = await this.subscriptions
      .findOne({
        userId: checkout.userId,
        status: {
          $in: [
            PlatformSubscriptionStatus.ACTIVE,
            PlatformSubscriptionStatus.TRIALING,
          ],
        },
      })
      .session(session);
    if (current) {
      throw new ConflictException(
        'User already has an active platform subscription',
      );
    }

    const start = new Date();
    const end = new Date(start.getTime() + checkout.periodDays * 86_400_000);
    const subscription = new this.subscriptions({
      userId: checkout.userId,
      currentEntitlementKey: 'current',
      planId: checkout.planId,
      status: PlatformSubscriptionStatus.ACTIVE,
      period: { start, end },
      renewal: { mode: checkout.renewalMode },
    });
    await subscription.save({ session });
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
        eventName: 'platform_subscription.activated',
        idempotencyKey: `platform-subscription-checkout:${checkout._id.toString()}`,
        payload: {
          checkoutId: checkout._id.toString(),
          subscriptionId: subscription._id.toString(),
          planId: checkout.planId.toString(),
          userId,
          paymentId: checkout.paymentId?.toString(),
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
