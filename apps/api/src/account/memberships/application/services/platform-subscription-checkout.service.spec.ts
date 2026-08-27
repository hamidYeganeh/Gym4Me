import { Types, type ClientSession } from 'mongoose';
import {
  EntityStatus,
  PaymentStatus,
  PlatformSubscriptionStatus,
} from '../../../../common/enums';
import {
  PlatformSubscriptionCheckoutStatus,
  type PlatformSubscriptionCheckoutDocument,
} from '../../../../schemas/platform-subscription-checkout.schema';
import type { PlatformSubscriptionDocument } from '../../../../schemas/platform-subscription.schema';
import { PlatformSubscriptionCheckoutPolicy } from '../policies/platform-subscription-checkout.policy';
import { PlatformSubscriptionCheckoutService } from './platform-subscription-checkout.service';

function queryOf<T>(value: T) {
  const promise = Promise.resolve(value) as Promise<T> & {
    session: jest.Mock;
  };
  promise.session = jest.fn().mockResolvedValue(value);
  return promise;
}

describe('PlatformSubscriptionCheckoutService', () => {
  const userId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const checkoutId = new Types.ObjectId();
  const paymentId = new Types.ObjectId();
  const session = {} as ClientSession;

  function setup() {
    const checkoutInstances: PlatformSubscriptionCheckoutDocument[] = [];
    const checkouts = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const checkout = {
          ...input,
          _id: checkoutId,
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as PlatformSubscriptionCheckoutDocument;
        checkoutInstances.push(checkout);
        return checkout;
      }),
      {
        findOne: jest.fn().mockResolvedValue(null),
        findOneAndUpdate: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        find: jest.fn(),
      },
    );
    const payments = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const plan = {
      _id: planId,
      name: 'طرح کسب‌وکار',
      pricing: { amount: 2_000, tax: 180, currency: 'IRT', periodDays: 30 },
      status: EntityStatus.ACTIVE,
      updatedAt: new Date('2026-08-25T00:00:00.000Z'),
    };
    const plans = { findOne: jest.fn().mockResolvedValue(plan) };
    const subscriptionInstances: PlatformSubscriptionDocument[] = [];
    const subscriptions = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const subscription = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as PlatformSubscriptionDocument;
        subscriptionInstances.push(subscription);
        return subscription;
      }),
      {
        exists: jest.fn().mockResolvedValue(null),
        findOne: jest.fn(),
        findById: jest.fn(),
        findOneAndUpdate: jest.fn(),
      },
    );
    const gateway = {
      createPayment: jest.fn().mockResolvedValue({
        authority: 'authority-1',
        redirectUrl: 'https://gateway.test/authority-1',
      }),
      verifyPayment: jest.fn().mockResolvedValue({ ok: true, refId: 'ref-1' }),
    };
    const finance = {
      recordPayment: jest.fn().mockResolvedValue({
        payment: { _id: paymentId },
        ledger: null,
        idempotent: false,
      }),
      capturePendingGatewayPayment: jest.fn().mockResolvedValue({
        payment: { _id: paymentId },
        ledger: { _id: new Types.ObjectId() },
        idempotent: false,
      }),
      runPaymentPostCommitEffects: jest.fn().mockResolvedValue(undefined),
    };
    const transactions = {
      run: jest.fn((work: (transactionSession: ClientSession) => unknown) =>
        Promise.resolve(work(session)),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn() };
    const policy = new PlatformSubscriptionCheckoutPolicy(
      plans as never,
      subscriptions as never,
    );
    const service = new PlatformSubscriptionCheckoutService(
      checkouts as never,
      payments as never,
      subscriptions as never,
      policy,
      gateway as never,
      finance as never,
      transactions as never,
      outbox as never,
      audit as never,
    );
    return {
      audit,
      checkoutInstances,
      checkouts,
      finance,
      gateway,
      outbox,
      payments,
      service,
      subscriptionInstances,
      subscriptions,
      transactions,
    };
  }

  it('persists a pending intent and sends the IRT price to the PSP in IRR', async () => {
    const { checkoutInstances, checkouts, finance, gateway, service } = setup();
    const preview = await service.preview(userId.toString(), {
      planId: planId.toString(),
    });
    checkouts.findOneAndUpdate.mockImplementation(
      (_filter: unknown, update: { $set?: Record<string, unknown> }) => {
        Object.assign(checkoutInstances[0], update.$set);
        return Promise.resolve(checkoutInstances[0]);
      },
    );

    const result = await service.initiate(userId.toString(), {
      planId: planId.toString(),
      idempotencyKey: 'platform-checkout-attempt-1',
      previewFingerprint: preview.fingerprint,
      priceReferenceAt: preview.priceReferenceAt,
      consentVersion: preview.consentVersion,
      consentAccepted: true,
      callbackUrl: 'https://app.gym4me.ir/owner/subscription',
    });

    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentStatus.PENDING,
        amount: {
          gross: 2_000,
          discount: 0,
          tax: 180,
          platformFee: 1_820,
          net: 0,
        },
        related: { platformPlanId: planId.toString() },
      }),
      { actorId: userId.toString(), session },
    );
    expect(gateway.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 20_000 }),
    );
    expect(result).toMatchObject({
      checkoutId: checkoutId.toString(),
      authority: 'authority-1',
    });
  });

  it('rejects stale client-supplied proration reference times', async () => {
    const { service } = setup();
    await expect(
      service.initiate(userId.toString(), {
        planId: planId.toString(),
        idempotencyKey: 'platform-checkout-stale-preview',
        previewFingerprint: 'a'.repeat(64),
        priceReferenceAt: new Date(Date.now() - 10 * 60_000).toISOString(),
        consentVersion: 'platform-subscription-checkout-v1',
        consentAccepted: true,
        callbackUrl: 'https://app.gym4me.ir/owner/subscription',
      }),
    ).rejects.toThrow('Platform subscription preview expired');
  });

  it('uses a subscription-state CAS before applying an upgrade', async () => {
    const { service, subscriptions } = setup();
    const previousPlanId = new Types.ObjectId();
    const previousStart = new Date('2026-08-01T00:00:00.000Z');
    const previousEnd = new Date('2026-09-01T00:00:00.000Z');
    const existing = {
      _id: new Types.ObjectId(),
      __v: 4,
      userId,
      planId: previousPlanId,
      currentEntitlementKey: 'current',
      period: { start: previousStart, end: previousEnd },
    };
    const updated = { ...existing, planId };
    subscriptions.findById.mockImplementation(() => queryOf(existing));
    subscriptions.findOneAndUpdate.mockResolvedValue(updated);
    const checkout = {
      userId,
      planId,
      subscriptionId: existing._id,
      changeKind: 'upgrade',
      previousPlanId,
      previousPeriodStart: previousStart,
      previousPeriodEnd: previousEnd,
      previousSubscriptionVersion: 4,
      periodDays: 30,
      renewalMode: 'manual',
      entitlementSnapshot: {
        schemaVersion: 1,
        audience: 'club_owner',
        capabilities: [],
        limits: [],
        graceDays: 7,
      },
    } as unknown as PlatformSubscriptionCheckoutDocument;

    const result = await (
      service as unknown as {
        applySubscriptionChange: (
          value: PlatformSubscriptionCheckoutDocument,
          valueSession: ClientSession,
        ) => Promise<PlatformSubscriptionDocument>;
      }
    ).applySubscriptionChange(checkout, session);

    expect(subscriptions.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: existing._id,
        planId: previousPlanId,
        __v: 4,
        'period.start': previousStart,
        'period.end': previousEnd,
      }),
      expect.objectContaining({ $inc: { __v: 1 } }),
      { returnDocument: 'after', session },
    );
    expect(result).toBe(updated);
  });

  it('verifies the provider before atomically activating entitlement and finance', async () => {
    const {
      audit,
      checkouts,
      finance,
      gateway,
      outbox,
      service,
      subscriptionInstances,
      subscriptions,
      transactions,
    } = setup();
    const checkout = {
      _id: checkoutId,
      userId,
      planId,
      paymentId,
      planName: 'طرح کسب‌وکار',
      periodDays: 30,
      renewalMode: 'manual',
      price: { gross: 2_000, tax: 180, payable: 2_000, currency: 'IRT' },
      fingerprint: 'a'.repeat(64),
      consentVersion: 'platform-subscription-checkout-v1',
      idempotencyKey: 'platform-checkout-attempt-1',
      status: PlatformSubscriptionCheckoutStatus.PENDING,
      authority: 'authority-1',
      expiresAt: new Date(Date.now() - 1_000),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as PlatformSubscriptionCheckoutDocument;
    checkouts.findOne.mockImplementation(() => queryOf(checkout));
    subscriptions.findOne.mockImplementation(() => queryOf(null));

    const result = await service.verify(
      userId.toString(),
      checkoutId.toString(),
      { authority: 'authority-1', status: 'OK' },
    );

    expect(gateway.verifyPayment.mock.invocationCallOrder[0]).toBeLessThan(
      transactions.run.mock.invocationCallOrder[0],
    );
    expect(subscriptionInstances[0]).toMatchObject({
      currentEntitlementKey: 'current',
      status: PlatformSubscriptionStatus.ACTIVE,
      planId,
    });
    expect(finance.capturePendingGatewayPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId,
        authority: 'authority-1',
        platformSubscriptionId: subscriptionInstances[0]._id,
      }),
      session,
    );
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'platform_subscription.activated',
      }),
      session,
    );
    expect(audit.log).toHaveBeenCalled();
    expect(result).toMatchObject({ status: 'completed' });
  });
});
