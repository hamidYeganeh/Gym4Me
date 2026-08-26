import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PlatformSubscriptionStatus } from '../../../../common/enums';
import type { PlatformPlanDocument } from '../../../../schemas/platform-plan.schema';
import type { PlatformSubscriptionDocument } from '../../../../schemas/platform-subscription.schema';
import { PlatformSubscriptionCheckoutPolicy } from './platform-subscription-checkout.policy';

describe('PlatformSubscriptionCheckoutPolicy plan changes', () => {
  const userId = new Types.ObjectId().toString();
  const oldPlanId = new Types.ObjectId();
  const newPlanId = new Types.ObjectId();
  const referenceAt = new Date('2026-08-26T00:00:00.000Z');
  const oldPlan = {
    _id: oldPlanId,
    name: 'Basic',
    pricing: { amount: 1_000, tax: 100, currency: 'IRT', periodDays: 30 },
    planVersion: 2,
    entitlementContract: {
      schemaVersion: 1,
      audience: 'club_owner',
      capabilities: [],
      limits: [],
      graceDays: 7,
    },
  } as unknown as PlatformPlanDocument;
  const newPlan = {
    _id: newPlanId,
    name: 'Pro',
    status: 'active',
    pricing: { amount: 3_000, tax: 300, currency: 'IRT', periodDays: 30 },
    planVersion: 4,
    entitlementContract: {
      schemaVersion: 1,
      audience: 'club_owner',
      capabilities: ['reports'],
      limits: [],
      graceDays: 7,
    },
    updatedAt: new Date('2026-08-20T00:00:00.000Z'),
  } as unknown as PlatformPlanDocument;
  const subscription = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(userId),
    currentEntitlementKey: 'current',
    planId: oldPlanId,
    status: PlatformSubscriptionStatus.ACTIVE,
    period: {
      start: new Date('2026-08-11T00:00:00.000Z'),
      end: new Date('2026-09-10T00:00:00.000Z'),
    },
    entitlementSnapshot: oldPlan.entitlementContract,
  } as unknown as PlatformSubscriptionDocument;

  function makePolicy(target: PlatformPlanDocument) {
    const plans = {
      findOne: jest.fn().mockResolvedValue(target),
      findById: jest.fn().mockResolvedValue(oldPlan),
    };
    const subscriptions = {
      findOne: jest.fn().mockResolvedValue(subscription),
    };
    return new PlatformSubscriptionCheckoutPolicy(
      plans as never,
      subscriptions as never,
    );
  }

  it('builds deterministic immediate-upgrade proration at a fixed reference time', async () => {
    const policy = makePolicy(newPlan);
    const first = await policy.buildSnapshot(
      userId,
      { planId: newPlanId.toString() },
      referenceAt,
    );
    const replay = await policy.buildSnapshot(
      userId,
      { planId: newPlanId.toString() },
      referenceAt,
    );

    expect(first.changeKind).toBe('upgrade');
    expect(first.remainingSeconds).toBe(15 * 86_400);
    expect(first.price.credit).toBe(450);
    expect(first.price.payable).toBe(2_550);
    expect(first.fingerprint).toBe(replay.fingerprint);
  });

  it('rejects an immediate downgrade so it can only be scheduled', async () => {
    const cheaper = {
      ...newPlan,
      _id: newPlanId,
      pricing: { ...newPlan.pricing, amount: 500 },
    } as unknown as PlatformPlanDocument;
    await expect(
      makePolicy(cheaper).buildSnapshot(
        userId,
        { planId: newPlanId.toString() },
        referenceAt,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
