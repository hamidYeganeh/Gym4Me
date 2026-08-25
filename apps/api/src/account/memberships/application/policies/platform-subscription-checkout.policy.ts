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

  async buildSnapshot(dto: PreviewPlatformSubscriptionCheckoutDto) {
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
    const price = {
      gross,
      tax,
      payable: gross,
      currency: plan.pricing.currency ?? 'IRT',
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
        }),
      )
      .digest('hex');
    return { plan, periodDays, price, fingerprint };
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
        tax: checkout.price.tax,
        platformFee: checkout.price.gross - checkout.price.tax,
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
