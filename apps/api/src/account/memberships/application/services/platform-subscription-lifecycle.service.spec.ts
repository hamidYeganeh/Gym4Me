import { Types, type ClientSession } from 'mongoose';
import { PlatformSubscriptionStatus } from '../../../../common/enums';
import { PlatformSubscriptionLifecycleService } from './platform-subscription-lifecycle.service';

function sessionQuery<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

function candidateQuery(id: Types.ObjectId) {
  return {
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: id }]),
      }),
    }),
  };
}

describe('PlatformSubscriptionLifecycleService', () => {
  const session = {} as ClientSession;
  const now = new Date('2026-09-10T00:00:00.000Z');

  function setup(overrides: Record<string, unknown> = {}, fallback?: unknown) {
    const id = new Types.ObjectId();
    const subscription = {
      _id: id,
      userId: new Types.ObjectId(),
      planId: new Types.ObjectId(),
      currentEntitlementKey: 'current',
      status: PlatformSubscriptionStatus.ACTIVE,
      period: {
        start: new Date('2026-08-01T00:00:00.000Z'),
        end: new Date('2026-09-01T00:00:00.000Z'),
      },
      entitlementSnapshot: {
        schemaVersion: 1,
        audience: 'club_owner',
        capabilities: [],
        limits: [],
        graceDays: 7,
      },
      graceEndsAt: new Date('2026-09-08T00:00:00.000Z'),
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    const subscriptions = {
      find: jest.fn().mockReturnValue(candidateQuery(id)),
      findById: jest.fn().mockReturnValue(sessionQuery(subscription)),
    };
    const plans = {
      findById: jest.fn().mockReturnValue(sessionQuery(fallback ?? null)),
    };
    const transactions = {
      run: jest.fn((work: (value: ClientSession) => unknown) => work(session)),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const service = new PlatformSubscriptionLifecycleService(
      subscriptions as never,
      plans as never,
      transactions as never,
      outbox as never,
    );
    return { outbox, plans, service, subscription };
  }

  it('enters grace once without deleting entitlement data', async () => {
    const { outbox, service, subscription } = setup({
      graceEndsAt: new Date('2026-09-12T00:00:00.000Z'),
    });

    await expect(service.reconcile(now)).resolves.toEqual({
      scanned: 1,
      grace: 1,
      fallback: 0,
      readOnly: 0,
    });
    expect(subscription).toMatchObject({
      status: PlatformSubscriptionStatus.PAST_DUE,
      entitlementSnapshot: expect.any(Object),
      graceEnteredAt: now,
    });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'platform_subscription.grace_entered',
      }),
      session,
    );
  });

  it('applies the configured free fallback after grace', async () => {
    const fallbackId = new Types.ObjectId();
    const fallback = {
      _id: fallbackId,
      pricing: { amount: 0, periodDays: 30 },
      entitlementContract: {
        schemaVersion: 1,
        audience: 'club_owner',
        capabilities: [],
        limits: [],
        graceDays: 7,
      },
      planVersion: 2,
      postExpirationMode: 'read_only',
    };
    const { outbox, service, subscription } = setup(
      {
        postExpirationModeSnapshot: 'free_plan',
        fallbackPlanIdSnapshot: fallbackId,
      },
      fallback,
    );

    const result = await service.reconcile(now);

    expect(result.fallback).toBe(1);
    expect(subscription).toMatchObject({
      planId: fallbackId,
      status: PlatformSubscriptionStatus.ACTIVE,
      entitlementSnapshot: fallback.entitlementContract,
      fallbackAppliedAt: now,
    });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'platform_subscription.fallback_applied',
      }),
      session,
    );
  });

  it('enters read-only after grace when no valid fallback exists', async () => {
    const { outbox, service, subscription } = setup({
      postExpirationModeSnapshot: 'read_only',
    });

    const result = await service.reconcile(now);

    expect(result.readOnly).toBe(1);
    expect(subscription).toMatchObject({
      status: PlatformSubscriptionStatus.PAST_DUE,
      readOnlyAt: now,
    });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'platform_subscription.read_only_entered',
      }),
      session,
    );
  });
});
