import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'node:crypto';
import { Model, Types } from 'mongoose';
import {
  EntityStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
  PlatformSubscriptionStatus,
  SubscriptionRenewalMode,
} from '../../../../common/enums';
import {
  PlatformPlan,
  type PlatformPlanDocument,
} from '../../../../schemas/platform-plan.schema';
import {
  type PlatformSubscriptionCheckoutDocument,
  PlatformSubscriptionCheckoutStatus,
} from '../../../../schemas/platform-subscription-checkout.schema';
import {
  PlatformSubscription,
  type PlatformSubscriptionDocument,
} from '../../../../schemas/platform-subscription.schema';
import type {
  InitiatePlatformSubscriptionCheckoutDto,
  PreviewPlatformSubscriptionCheckoutDto,
} from '../../dto/membership.dto';

export const PLATFORM_SUBSCRIPTION_CONSENT_VERSION =
  'platform-subscription-checkout-v1';

@Injectable()
export class PlatformSubscriptionCheckoutPolicy {
  constructor(
    @InjectModel(PlatformPlan.name)
    private readonly plans: Model<PlatformPlanDocument>,
    @InjectModel(PlatformSubscription.name)
    private readonly subscriptions: Model<PlatformSubscriptionDocument>,
  ) {}

  async buildSnapshot(
    userId: string,
    dto: PreviewPlatformSubscriptionCheckoutDto,
    referenceAt = new Date(),
  ) {
    const plan = await this.plans.findOne({
      _id: new Types.ObjectId(dto.planId),
      status: EntityStatus.ACTIVE,
    });
    if (!plan) throw new NotFoundException('Active platform plan not found');
    const gross = plan.pricing.amount;
    const tax = plan.pricing.tax ?? 0;
    if (tax > gross) {
      throw new ConflictException('Platform plan tax exceeds its price');
    }
    const periodDays = plan.pricing.periodDays ?? 30;
    const current = await this.subscriptions.findOne({
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
    const currentPlan = current
      ? await this.plans.findById(current.planId)
      : null;
    if (current && !currentPlan) {
      throw new ConflictException('Current platform plan not found');
    }
    let changeKind: 'initial' | 'renewal' | 'upgrade' = 'initial';
    let credit = 0;
    let remainingSeconds = 0;
    let previousNetPrice = 0;
    if (current && currentPlan) {
      if (current.planId.toString() === plan._id.toString()) {
        changeKind = 'renewal';
      } else if (
        current.scheduledPlanId?.toString() === plan._id.toString() &&
        referenceAt.getTime() >= current.period.end.getTime()
      ) {
        changeKind = 'renewal';
      } else if (plan.pricing.amount > currentPlan.pricing.amount) {
        changeKind = 'upgrade';
        const periodSeconds = Math.max(
          1,
          Math.floor(
            (current.period.end.getTime() - current.period.start.getTime()) /
              1000,
          ),
        );
        remainingSeconds = Math.max(
          0,
          Math.floor(
            (current.period.end.getTime() - referenceAt.getTime()) / 1000,
          ),
        );
        previousNetPrice = Math.max(
          0,
          currentPlan.pricing.amount - (currentPlan.pricing.tax ?? 0),
        );
        credit = Math.floor(
          (previousNetPrice * Math.min(remainingSeconds, periodSeconds)) /
            periodSeconds,
        );
      } else {
        throw new ConflictException(
          'Downgrades must be scheduled for the current period end',
        );
      }
      if (
        current.entitlementSnapshot?.audience &&
        plan.entitlementContract?.audience &&
        current.entitlementSnapshot.audience !==
          plan.entitlementContract.audience
      ) {
        throw new ConflictException('Plan audience cannot be changed');
      }
    }
    const price = {
      gross,
      tax,
      payable: Math.max(0, gross - credit),
      currency: plan.pricing.currency ?? 'IRT',
      credit,
    };
    const fingerprint = createHash('sha256')
      .update(
        JSON.stringify({
          planId: plan._id.toString(),
          planUpdatedAt: plan.updatedAt?.toISOString() ?? null,
          consentVersion: PLATFORM_SUBSCRIPTION_CONSENT_VERSION,
          renewalMode: dto.renewalMode ?? SubscriptionRenewalMode.MANUAL,
          periodDays,
          price,
          changeKind,
          currentSubscriptionId: current?._id.toString() ?? null,
          currentPlanId: currentPlan?._id.toString() ?? null,
          currentPeriod: current
            ? {
                start: current.period.start.toISOString(),
                end: current.period.end.toISOString(),
              }
            : null,
          currentSubscriptionVersion: current?.__v ?? 0,
          planVersion: plan.planVersion ?? 1,
          entitlementContract: plan.entitlementContract ?? null,
          referenceAt: referenceAt.toISOString(),
          previousNetPrice,
          remainingSeconds,
          roundingPolicy: 'floor',
        }),
      )
      .digest('hex');
    return {
      plan,
      current,
      currentPlan,
      periodDays,
      price,
      fingerprint,
      changeKind,
      referenceAt,
      previousNetPrice,
      remainingSeconds,
      previousPeriodStart: current?.period.start,
      previousPeriodEnd: current?.period.end,
      previousSubscriptionVersion: current?.__v ?? 0,
      roundingPolicy: 'floor' as const,
    };
  }

  async assertNoCurrentSubscription(userId: string) {
    const active = await this.subscriptions.exists({
      userId: new Types.ObjectId(userId),
      status: {
        $in: [
          PlatformSubscriptionStatus.ACTIVE,
          PlatformSubscriptionStatus.TRIALING,
        ],
      },
    });
    if (active) {
      throw new ConflictException(
        'User already has an active platform subscription',
      );
    }
  }

  assertReplay(
    checkout: PlatformSubscriptionCheckoutDocument,
    dto: InitiatePlatformSubscriptionCheckoutDto,
  ) {
    if (
      checkout.planId.toString() !== dto.planId ||
      checkout.renewalMode !==
        (dto.renewalMode ?? SubscriptionRenewalMode.MANUAL) ||
      checkout.consentVersion !== dto.consentVersion ||
      checkout.fingerprint !== dto.previewFingerprint
    ) {
      throw new ConflictException(
        'Checkout idempotency key has different semantics',
      );
    }
  }

  assertPending(
    checkout: PlatformSubscriptionCheckoutDocument,
    authority?: string,
    allowExpired = false,
  ) {
    if (checkout.status !== PlatformSubscriptionCheckoutStatus.PENDING) {
      throw new ConflictException('Subscription checkout is not pending');
    }
    if (!allowExpired && checkout.expiresAt.getTime() <= Date.now()) {
      throw new ConflictException('Subscription checkout expired');
    }
    if (authority && checkout.authority !== authority) {
      throw new BadRequestException('Unknown payment authority');
    }
  }

  paymentDto(
    checkout: PlatformSubscriptionCheckoutDocument,
    gatewayRefId?: string,
  ) {
    return {
      purpose: PaymentPurpose.PLATFORM_SUBSCRIPTION,
      channel: PaymentChannel.ZARINPAL,
      status: gatewayRefId ? PaymentStatus.CAPTURED : PaymentStatus.PENDING,
      amount: {
        gross: checkout.price.gross,
        discount: checkout.price.credit,
        tax: checkout.price.tax,
        platformFee: Math.max(
          0,
          checkout.price.gross - checkout.price.credit - checkout.price.tax,
        ),
        net: 0,
      },
      reference: {
        orderId: `platform-subscription-checkout:${checkout._id.toString()}`,
        authority: checkout.authority,
        gatewayRefId,
      },
      payer: { userId: checkout.userId.toString() },
      related: {
        platformPlanId: checkout.planId.toString(),
        platformSubscriptionId: checkout.subscriptionId?.toString(),
      },
      idempotencyKey: `platform-subscription-checkout:${checkout._id.toString()}`,
    };
  }
}
