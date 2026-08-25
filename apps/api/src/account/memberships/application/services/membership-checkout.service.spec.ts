import { BadRequestException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import {
  EntityStatus,
  MembershipPlanKind,
  MembershipStatus,
  PaymentStatus,
  PublishStatus,
} from '../../../../common/enums';
import type { ClubMembershipDocument } from '../../../../schemas/club-membership.schema';
import {
  MembershipCheckoutMode,
  MembershipCheckoutStatus,
  type MembershipCheckoutDocument,
} from '../../../../schemas/membership-checkout.schema';
import { MembershipCheckoutService } from './membership-checkout.service';

function queryOf<T>(value: T) {
  const promise = Promise.resolve(value) as Promise<T> & {
    session: jest.Mock;
  };
  promise.session = jest.fn().mockResolvedValue(value);
  return promise;
}

describe('MembershipCheckoutService', () => {
  const userId = new Types.ObjectId();
  const clubId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const checkoutId = new Types.ObjectId();
  const paymentId = new Types.ObjectId();
  const session = {} as ClientSession;

  function plan() {
    return {
      _id: planId,
      clubId,
      name: '۱۲ جلسه',
      kind: MembershipPlanKind.SESSIONS,
      sessionsTotal: 12,
      pricing: { amount: 1_000, tax: 90, currency: 'IRT' },
      status: EntityStatus.ACTIVE,
      publishStatus: PublishStatus.PUBLISHED,
      updatedAt: new Date('2026-08-25T00:00:00.000Z'),
    };
  }

  function setup() {
    const checkoutInstances: MembershipCheckoutDocument[] = [];
    const checkoutModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const checkout = {
          ...input,
          _id: checkoutId,
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as MembershipCheckoutDocument;
        checkoutInstances.push(checkout);
        return checkout;
      }),
      {
        findOne: jest.fn().mockResolvedValue(null),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      },
    );
    const payments = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const clubs = { findOne: jest.fn().mockResolvedValue({ _id: clubId }) };
    const membershipInstances: ClubMembershipDocument[] = [];
    const memberships = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const membership = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as ClubMembershipDocument;
        membershipInstances.push(membership);
        return membership;
      }),
      {
        findOne: jest.fn(),
        findById: jest.fn(),
      },
    );
    const plans = { findOne: jest.fn().mockResolvedValue(plan()) };
    const eventInstances: Array<Record<string, unknown>> = [];
    const events = jest.fn().mockImplementation((input) => {
      const event = {
        ...input,
        _id: new Types.ObjectId(),
        save: jest.fn().mockResolvedValue(undefined),
      };
      eventInstances.push(event);
      return event;
    });
    const renewals = { preview: jest.fn() };
    const gateway = {
      createPayment: jest.fn().mockResolvedValue({
        authority: 'authority-1',
        redirectUrl: 'https://gateway.test/authority-1',
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        ok: true,
        refId: 'ref-1',
      }),
    };
    const paymentResult = {
      payment: { _id: paymentId },
      ledger: null,
      idempotent: false,
    };
    const finance = {
      recordPayment: jest.fn().mockResolvedValue(paymentResult),
      capturePendingGatewayPayment: jest.fn().mockResolvedValue({
        payment: { _id: paymentId },
        ledger: { _id: new Types.ObjectId() },
        idempotent: false,
      }),
      runPaymentPostCommitEffects: jest.fn().mockResolvedValue(undefined),
    };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn() };
    const service = new MembershipCheckoutService(
      checkoutModel as never,
      payments as never,
      clubs as never,
      memberships as never,
      plans as never,
      events as never,
      renewals as never,
      gateway as never,
      finance as never,
      transactions as never,
      outbox as never,
      audit as never,
    );
    return {
      audit,
      checkoutInstances,
      checkoutModel,
      clubs,
      eventInstances,
      finance,
      gateway,
      membershipInstances,
      memberships,
      outbox,
      payments,
      plans,
      renewals,
      service,
      transactions,
    };
  }

  it('previews, persists a pending payment intent, and initiates in rials', async () => {
    const {
      checkoutInstances,
      checkoutModel,
      finance,
      gateway,
      payments,
      service,
    } = setup();
    const preview = await service.preview(userId.toString(), {
      clubId: clubId.toString(),
      planId: planId.toString(),
    });
    checkoutModel.findOneAndUpdate.mockImplementation(
      (_filter: unknown, update: { $set?: Record<string, unknown> }) => {
        Object.assign(checkoutInstances[0], update.$set);
        return Promise.resolve(checkoutInstances[0]);
      },
    );

    const result = await service.initiate(userId.toString(), {
      clubId: clubId.toString(),
      planId: planId.toString(),
      idempotencyKey: 'checkout-attempt-1',
      previewFingerprint: preview.fingerprint,
      consentVersion: 'membership-checkout-v1',
      consentAccepted: true,
      callbackUrl: 'https://app.gym4me.ir/athlete/memberships',
    });

    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentStatus.PENDING,
        amount: { gross: 1_000, discount: 0, tax: 90 },
        related: expect.objectContaining({
          clubId: clubId.toString(),
          membershipPlanId: planId.toString(),
        }),
      }),
      { actorId: userId.toString(), session },
    );
    expect(checkoutInstances[0]).toMatchObject({
      mode: MembershipCheckoutMode.PURCHASE,
      creditGrant: { sessions: 12 },
      status: MembershipCheckoutStatus.PENDING,
      paymentId,
    });
    expect(gateway.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10_000 }),
    );
    expect(payments.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: paymentId }),
      expect.objectContaining({
        $set: expect.objectContaining({
          'reference.authority': 'authority-1',
        }),
      }),
    );
    expect(result).toMatchObject({
      checkoutId: checkoutId.toString(),
      authority: 'authority-1',
      idempotent: false,
    });
  });

  it('fulfills a provider-captured renewal after browser TTL without overwriting later credit use', async () => {
    const {
      audit,
      checkoutModel,
      eventInstances,
      finance,
      gateway,
      memberships,
      outbox,
      service,
      transactions,
    } = setup();
    const membership = {
      _id: new Types.ObjectId(),
      clubId,
      planId,
      holder: { userId },
      status: MembershipStatus.ACTIVE,
      credit: { remainingSessions: 2 },
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as ClubMembershipDocument;
    const checkout = {
      _id: checkoutId,
      userId,
      clubId,
      planId,
      membershipId: membership._id,
      paymentId,
      mode: MembershipCheckoutMode.RENEWAL,
      planName: '۱۲ جلسه',
      price: { gross: 1_000, discount: 0, tax: 90, payable: 1_000 },
      currentCredit: { remainingSessions: 4 },
      resultingCredit: { remainingSessions: 16 },
      creditGrant: { sessions: 12 },
      fingerprint: 'a'.repeat(64),
      consentVersion: 'membership-renewal-v1',
      authority: 'authority-1',
      redirectUrl: 'https://gateway.test/authority-1',
      status: MembershipCheckoutStatus.PENDING,
      expiresAt: new Date(Date.now() - 1),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as MembershipCheckoutDocument;
    checkoutModel.findOne.mockImplementation(() => queryOf(checkout));
    memberships.findOne.mockImplementation(() => queryOf(membership));

    const result = await service.verify(
      userId.toString(),
      checkoutId.toString(),
      { authority: 'authority-1', status: 'OK' },
    );

    expect(gateway.verifyPayment.mock.invocationCallOrder[0]).toBeLessThan(
      transactions.run.mock.invocationCallOrder[0],
    );
    expect(membership.credit).toEqual({ remainingSessions: 14 });
    expect(membership.save).toHaveBeenCalledWith({ session });
    expect(finance.capturePendingGatewayPayment).toHaveBeenCalledWith(
      {
        paymentId,
        authority: 'authority-1',
        gatewayRefId: 'ref-1',
        membershipId: membership._id,
      },
      session,
    );
    expect(eventInstances[0]).toMatchObject({
      membershipId: membership._id,
      requestFingerprint: 'a'.repeat(64),
    });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'membership.renewed' }),
      session,
    );
    expect(checkout).toMatchObject({
      status: MembershipCheckoutStatus.COMPLETED,
      gatewayRefId: 'ref-1',
    });
    expect(finance.runPaymentPostCommitEffects).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: MembershipCheckoutStatus.COMPLETED,
      membershipId: membership._id.toString(),
    });
  });

  it('does not mutate Mongo when provider verification fails', async () => {
    const { checkoutModel, gateway, service, transactions } = setup();
    const checkout = {
      _id: checkoutId,
      userId,
      authority: 'authority-1',
      status: MembershipCheckoutStatus.PENDING,
      expiresAt: new Date(Date.now() + 60_000),
      price: { payable: 1_000 },
    } as MembershipCheckoutDocument;
    checkoutModel.findOne.mockResolvedValue(checkout);
    gateway.verifyPayment.mockResolvedValue({
      ok: false,
      code: -1,
      message: 'provider rejected',
    });

    await expect(
      service.verify(userId.toString(), checkoutId.toString(), {
        authority: 'authority-1',
        status: 'OK',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('expires stale pending intents and cancels their pending payments', async () => {
    const { checkoutModel, payments, service } = setup();
    const expired = {
      _id: checkoutId,
      paymentId,
      status: MembershipCheckoutStatus.PENDING,
      expiresAt: new Date(Date.now() - 1),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as MembershipCheckoutDocument;
    checkoutModel.find
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      })
      .mockReturnValueOnce({
        limit: jest.fn().mockResolvedValue([expired]),
      });
    checkoutModel.findOne.mockImplementation(() => queryOf(expired));

    await expect(service.reconcilePending()).resolves.toEqual({
      scanned: 0,
      captured: 0,
      unresolved: 0,
      expired: 1,
    });
    expect(expired.status).toBe(MembershipCheckoutStatus.EXPIRED);
    expect(expired.save).toHaveBeenCalledWith({ session });
    expect(payments.updateOne).toHaveBeenCalledWith(
      { _id: paymentId, status: PaymentStatus.PENDING },
      expect.objectContaining({
        $set: expect.objectContaining({ status: PaymentStatus.CANCELLED }),
      }),
      { session },
    );
  });
});
