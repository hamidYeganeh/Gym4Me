import { Types } from 'mongoose';
import { PlatformSubscriptionStatus } from '../../../../common/enums';
import { PlatformEntitlementService } from './platform-entitlement.service';

describe('PlatformEntitlementService', () => {
  const userId = new Types.ObjectId().toString();
  const clubId = new Types.ObjectId().toString();
  const upgradePlanId = new Types.ObjectId().toString();

  function service(
    subscription: unknown,
    usage = 0,
    ownsClub = true,
    upgradePlans: Array<{
      _id: Types.ObjectId;
      pricing: { amount: number };
      entitlementContract: { limits: Array<{ key: string; value: number | null; mode: string }> };
    }> = [],
  ) {
    const plansFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue({ pricing: { amount: 100 } }),
        lean: jest.fn().mockResolvedValue({ pricing: { amount: 100 } }),
      }),
      session: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(upgradePlans),
      }),
    });
    return new PlatformEntitlementService(
      { findOne: jest.fn().mockResolvedValue(subscription) } as never,
      {
        countDocuments: jest.fn().mockResolvedValue(usage),
        exists: jest.fn().mockResolvedValue(ownsClub),
      } as never,
      { countDocuments: jest.fn().mockResolvedValue(usage) } as never,
      { countDocuments: jest.fn().mockResolvedValue(usage) } as never,
      {
        exists: jest.fn().mockResolvedValue(true),
        findById: plansFind,
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              session: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(upgradePlans),
              }),
              lean: jest.fn().mockResolvedValue(upgradePlans),
            }),
          }),
        }),
      } as never,
      { updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }) } as never,
      {
        aggregate: jest.fn().mockReturnValue({
          session: jest.fn().mockResolvedValue([{ total: usage }]),
        }),
      } as never,
      { run: jest.fn() } as never,
      { track: jest.fn().mockResolvedValue(undefined) } as never,
    );
  }

  const active = {
    planId: new Types.ObjectId(),
    period: {
      start: new Date('2026-08-01T00:00:00.000Z'),
      end: new Date('2026-09-01T00:00:00.000Z'),
    },
    status: PlatformSubscriptionStatus.ACTIVE,
    entitlementSnapshot: {
      schemaVersion: 1,
      audience: 'club_owner',
      capabilities: [],
      limits: [{ key: 'staff.active_per_club', value: 2, mode: 'hard' }],
      graceDays: 7,
    },
    graceEndsAt: new Date('2026-09-08T00:00:00.000Z'),
  };

  it('rejects the increment that exceeds a hard limit', async () => {
    const decision = await service(active, 2).evaluate({
      userId,
      clubId,
      key: 'staff.active_per_club',
      now: new Date('2026-08-26T00:00:00.000Z'),
    });
    expect(decision).toMatchObject({
      allowed: false,
      reasonCode: 'entitlement_limit_reached',
      usage: 2,
      limit: 2,
      state: 'active',
    });
  });

  it('keeps legacy subscriptions unlimited until backfill', async () => {
    const decision = await service({
      ...active,
      entitlementSnapshot: undefined,
    }).evaluate({ userId, key: 'clubs.active' });
    expect(decision).toMatchObject({
      allowed: true,
      reasonCode: 'legacy_unlimited',
      state: 'legacy_unlimited',
    });
  });

  it('makes incrementing mutations read-only during grace', async () => {
    const decision = await service(active).evaluate({
      userId,
      clubId,
      key: 'staff.active_per_club',
      now: new Date('2026-09-04T00:00:00.000Z'),
    });
    expect(decision).toMatchObject({
      allowed: false,
      reasonCode: 'subscription_grace_read_only',
      state: 'grace',
    });
  });

  it('does not disclose another club usage', async () => {
    await expect(
      service(active, 1, false).evaluate({
        userId,
        clubId,
        key: 'staff.active_per_club',
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('projects monthly messaging usage from immutable usage facts', async () => {
    const messagingSubscription = {
      ...active,
      entitlementSnapshot: {
        ...active.entitlementSnapshot,
        limits: [
          {
            key: 'monthly_messages.transactional',
            value: 100,
            mode: 'hard',
          },
        ],
      },
    };
    const decision = await service(messagingSubscription, 80).evaluate({
      userId,
      clubId,
      key: 'monthly_messages.transactional',
      incrementBy: 21,
      now: new Date('2026-08-26T00:00:00.000Z'),
    });
    expect(decision).toMatchObject({
      allowed: false,
      usage: 80,
      limit: 100,
      reasonCode: 'entitlement_limit_reached',
    });
  });

  it('uses the Tehran civil month at a UTC boundary', () => {
    expect(
      service(active).tehranMonthBucket(new Date('2026-08-31T20:30:00.000Z')),
    ).toBe('2026-09');
  });

  it('allows soft-limit overage and resolves upgrade plans', async () => {
    const softSubscription = {
      ...active,
      entitlementSnapshot: {
        ...active.entitlementSnapshot,
        limits: [{ key: 'staff.active_per_club', value: 2, mode: 'soft' }],
      },
    };
    const svc = service(softSubscription, 2, true, [
      {
        _id: upgradePlanId,
        pricing: { amount: 200 },
        entitlementContract: {
          limits: [{ key: 'staff.active_per_club', value: 5, mode: 'hard' }],
        },
      },
    ]);
    const decision = await svc.evaluate({
      userId,
      clubId,
      key: 'staff.active_per_club',
      incrementBy: 1,
    });
    expect(decision).toMatchObject({
      allowed: true,
      reasonCode: 'soft_limit_exceeded',
      upgradePlanIds: [upgradePlanId.toString()],
    });
  });

  it('records a monthly soft-limit exposure event once', async () => {
    const softSubscription = {
      ...active,
      entitlementSnapshot: {
        ...active.entitlementSnapshot,
        limits: [{ key: 'staff.active_per_club', value: 1, mode: 'soft' }],
      },
    };
    const events = { track: jest.fn().mockResolvedValue(undefined) };
    const svc = new PlatformEntitlementService(
      { findOne: jest.fn().mockResolvedValue(softSubscription) } as never,
      {
        countDocuments: jest.fn().mockResolvedValue(1),
        exists: jest.fn().mockResolvedValue(true),
      } as never,
      { countDocuments: jest.fn().mockResolvedValue(1) } as never,
      { countDocuments: jest.fn().mockResolvedValue(1) } as never,
      {
        exists: jest.fn().mockResolvedValue(true),
        findById: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ pricing: { amount: 100 } }),
          }),
        }),
        find: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as never,
      { updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }) } as never,
      {
        aggregate: jest.fn().mockReturnValue({
          session: jest.fn().mockResolvedValue([{ total: 0 }]),
        }),
      } as never,
      { run: jest.fn() } as never,
      events as never,
    );
    await svc.assertIncrementAllowed({
      userId,
      clubId,
      key: 'staff.active_per_club',
      incrementBy: 1,
    });
    expect(events.track).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'platform_entitlement_soft_limit',
        properties: expect.objectContaining({ key: 'staff.active_per_club' }),
      }),
    );
  });
});
