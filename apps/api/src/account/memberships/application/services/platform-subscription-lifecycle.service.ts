import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSubscriptionStatus } from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import {
  PlatformPlan,
  type PlatformPlanDocument,
} from '../../../../schemas/platform-plan.schema';
import {
  PlatformSubscription,
  type PlatformSubscriptionDocument,
} from '../../../../schemas/platform-subscription.schema';

@Injectable()
export class PlatformSubscriptionLifecycleService {
  constructor(
    @InjectModel(PlatformSubscription.name)
    private readonly subscriptions: Model<PlatformSubscriptionDocument>,
    @InjectModel(PlatformPlan.name)
    private readonly plans: Model<PlatformPlanDocument>,
    private readonly transactions: MongoTransactionService,
    private readonly outbox: OutboxService,
  ) {}

  async reconcile(now = new Date(), limit = 100) {
    const candidates = await this.subscriptions
      .find({
        currentEntitlementKey: 'current',
        status: {
          $in: [
            PlatformSubscriptionStatus.ACTIVE,
            PlatformSubscriptionStatus.TRIALING,
            PlatformSubscriptionStatus.PAST_DUE,
          ],
        },
        'period.end': { $lt: now },
      })
      .sort({ 'period.end': 1 })
      .limit(limit)
      .select({ _id: 1 });
    const result = {
      scanned: candidates.length,
      grace: 0,
      fallback: 0,
      readOnly: 0,
    };
    for (const candidate of candidates) {
      const transition = await this.reconcileOne(candidate._id.toString(), now);
      if (transition) result[transition] += 1;
    }
    return result;
  }

  private reconcileOne(subscriptionId: string, now: Date) {
    return this.transactions.run(async (session) => {
      const subscription = await this.subscriptions
        .findById(subscriptionId)
        .session(session);
      if (
        !subscription ||
        subscription.currentEntitlementKey !== 'current' ||
        subscription.period.end.getTime() >= now.getTime()
      ) {
        return null;
      }
      const graceEndsAt =
        subscription.graceEndsAt ??
        new Date(
          subscription.period.end.getTime() +
            (subscription.entitlementSnapshot?.graceDays ?? 7) * 86_400_000,
        );
      subscription.graceEndsAt = graceEndsAt;
      if (graceEndsAt.getTime() >= now.getTime()) {
        if (subscription.graceEnteredAt) return null;
        subscription.status = PlatformSubscriptionStatus.PAST_DUE;
        subscription.graceEnteredAt = now;
        await subscription.save({ session });
        await this.outbox.enqueue(
          {
            eventName: 'platform_subscription.grace_entered',
            idempotencyKey: `platform-subscription-grace:${subscription._id.toString()}:${graceEndsAt.toISOString()}`,
            payload: {
              subscriptionId: subscription._id.toString(),
              userId: subscription.userId.toString(),
              graceEndsAt: graceEndsAt.toISOString(),
            },
          },
          session,
        );
        return 'grace' as const;
      }

      if (
        subscription.postExpirationModeSnapshot === 'free_plan' &&
        subscription.fallbackPlanIdSnapshot
      ) {
        if (subscription.fallbackAppliedAt) return null;
        const fallback = await this.plans
          .findById(subscription.fallbackPlanIdSnapshot)
          .session(session);
        if (
          fallback &&
          fallback.pricing.amount === 0 &&
          fallback.entitlementContract
        ) {
          const start = now;
          const end = new Date(
            start.getTime() + (fallback.pricing.periodDays ?? 30) * 86_400_000,
          );
          subscription.planId = fallback._id;
          subscription.status = PlatformSubscriptionStatus.ACTIVE;
          subscription.period = { start, end };
          subscription.entitlementSnapshot = fallback.entitlementContract;
          subscription.planVersion = fallback.planVersion ?? 1;
          subscription.postExpirationModeSnapshot = fallback.postExpirationMode;
          subscription.fallbackPlanIdSnapshot = fallback.fallbackPlanId;
          subscription.graceEndsAt = new Date(
            end.getTime() +
              (fallback.entitlementContract.graceDays ?? 7) * 86_400_000,
          );
          subscription.fallbackAppliedAt = now;
          subscription.graceEnteredAt = undefined;
          subscription.readOnlyAt = undefined;
          subscription.scheduledPlanId = undefined;
          subscription.scheduledPlanEffectiveAt = undefined;
          await subscription.save({ session });
          await this.outbox.enqueue(
            {
              eventName: 'platform_subscription.fallback_applied',
              idempotencyKey: `platform-subscription-fallback:${subscription._id.toString()}:${fallback._id.toString()}`,
              payload: {
                subscriptionId: subscription._id.toString(),
                userId: subscription.userId.toString(),
                planId: fallback._id.toString(),
              },
            },
            session,
          );
          return 'fallback' as const;
        }
      }

      if (subscription.readOnlyAt) return null;
      subscription.status = PlatformSubscriptionStatus.PAST_DUE;
      subscription.readOnlyAt = now;
      await subscription.save({ session });
      await this.outbox.enqueue(
        {
          eventName: 'platform_subscription.read_only_entered',
          idempotencyKey: `platform-subscription-read-only:${subscription._id.toString()}:${graceEndsAt.toISOString()}`,
          payload: {
            subscriptionId: subscription._id.toString(),
            userId: subscription.userId.toString(),
          },
        },
        session,
      );
      return 'readOnly' as const;
    });
  }
}
