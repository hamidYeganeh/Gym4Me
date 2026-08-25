import { ConflictException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import {
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../../common/enums';
import type { ClubMembershipDocument } from '../../../../schemas/club-membership.schema';
import { RenewMembershipCommand } from './renew-membership.command';

function queryOf<T>(value: T) {
  const query = Promise.resolve(value) as Promise<T> & { session: jest.Mock };
  query.session = jest.fn().mockReturnValue(query);
  return query;
}

describe('RenewMembershipCommand', () => {
  const session = {} as ClientSession;
  const clubId = new Types.ObjectId();
  const membershipId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const holderId = new Types.ObjectId();
  const actor = {
    userId: new Types.ObjectId().toString(),
    kind: MembershipActorKind.OWNER,
  };

  function setup() {
    const membership = {
      _id: membershipId,
      clubId,
      planId,
      holder: { userId: holderId },
      status: MembershipStatus.ACTIVE,
      credit: { remainingSessions: 4 },
      save: jest.fn().mockResolvedValue(undefined),
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    } as unknown as ClubMembershipDocument;
    const plan = {
      _id: planId,
      clubId,
      name: '۱۲ جلسه',
      kind: MembershipPlanKind.SESSIONS,
      sessionsTotal: 12,
      pricing: { amount: 1_000, tax: 0, currency: 'IRT' },
      status: EntityStatus.ACTIVE,
      updatedAt: new Date('2026-08-20T00:00:00.000Z'),
    };
    const membershipModel = {
      findOne: jest.fn().mockImplementation(() => queryOf(membership)),
      findById: jest.fn().mockImplementation(() => queryOf(membership)),
    };
    const planModel = {
      findOne: jest.fn().mockImplementation(() => queryOf(plan)),
    };
    const events: Array<Record<string, unknown>> = [];
    const eventModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const event = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        };
        events.push(event);
        return event;
      }),
      { findOne: jest.fn().mockImplementation(() => queryOf(null)) },
    );
    const paymentId = new Types.ObjectId();
    const debtId = new Types.ObjectId();
    const paymentResult = {
      idempotent: false,
      payment: { _id: paymentId },
      ledger: {},
    };
    const finance = {
      recordPayment: jest.fn().mockResolvedValue(paymentResult),
      createDebt: jest.fn().mockResolvedValue({ debt: { _id: debtId } }),
      runPaymentPostCommitEffects: jest.fn().mockResolvedValue(undefined),
    };
    const coupons = {
      preview: jest.fn().mockResolvedValue({
        code: 'SAVE100',
        discount: 100,
        payable: 900,
      }),
      redeem: jest.fn().mockResolvedValue({ discount: 100 }),
    };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn() };
    const command = new RenewMembershipCommand(
      membershipModel as never,
      planModel as never,
      eventModel as never,
      finance as never,
      coupons as never,
      transactions as never,
      outbox as never,
      audit as never,
    );
    return {
      audit,
      command,
      coupons,
      debtId,
      events,
      finance,
      membership,
      outbox,
      paymentId,
      paymentResult,
      transactions,
    };
  }

  it('previews same-plan price and additive credit without mutation', async () => {
    const { command, membership, transactions } = setup();

    const preview = await command.preview(
      clubId.toString(),
      membershipId.toString(),
      {
        couponCode: 'SAVE100',
      },
    );

    expect(preview).toMatchObject({
      consentVersion: 'membership-renewal-v1',
      membershipId: membershipId.toString(),
      price: {
        gross: 1_000,
        discount: 100,
        payable: 900,
        currency: 'IRT',
      },
      currentCredit: { remainingSessions: 4 },
      renewedCredit: { remainingSessions: 16 },
    });
    expect(preview.previewFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(membership.save).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('atomically renews, records partial payment/debt, event and outbox', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-25T08:00:00.000Z'));
    const {
      audit,
      command,
      debtId,
      events,
      finance,
      membership,
      outbox,
      paymentId,
      paymentResult,
    } = setup();
    const preview = await command.preview(
      clubId.toString(),
      membershipId.toString(),
      {
        couponCode: 'SAVE100',
      },
    );

    const result = await command.execute(
      clubId.toString(),
      membershipId.toString(),
      {
        couponCode: 'SAVE100',
        idempotencyKey: 'renewal-attempt-1',
        previewFingerprint: preview.previewFingerprint,
        consentVersion: 'membership-renewal-v1',
        consentAccepted: true,
        channel: PaymentChannel.CASH,
        paidAmount: 500,
      },
      actor,
    );

    expect(membership.credit).toMatchObject({ remainingSessions: 16 });
    expect(membership.paymentId).toEqual(paymentId);
    expect(membership.save).toHaveBeenCalledWith({ session });
    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: PaymentPurpose.MEMBERSHIP,
        status: PaymentStatus.CAPTURED,
        amount: { gross: 500 },
      }),
      expect.objectContaining({ session }),
    );
    expect(finance.createDebt).toHaveBeenCalledWith(
      clubId.toString(),
      expect.objectContaining({
        membershipId: membershipId.toString(),
        principal: 400,
      }),
      session,
    );
    expect(events[0]).toMatchObject({
      type: MembershipEventType.RENEWED,
      idempotencyKey: 'renewal-attempt-1',
      requestFingerprint: preview.previewFingerprint,
      payload: expect.objectContaining({
        paymentId: paymentId.toString(),
        debtId: debtId.toString(),
        consentVersion: 'membership-renewal-v1',
      }),
    });
    expect(events[0]?.save).toHaveBeenCalledWith({ session });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'membership.renewed' }),
      session,
    );
    expect(finance.runPaymentPostCommitEffects).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ actorId: actor.userId }),
      paymentResult,
    );
    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      membership: { id: membershipId.toString() },
      idempotent: false,
    });
    jest.useRealTimers();
  });

  it('rejects confirmation when the accepted preview is stale', async () => {
    const { command, finance } = setup();

    await expect(
      command.execute(
        clubId.toString(),
        membershipId.toString(),
        {
          idempotencyKey: 'renewal-attempt-2',
          previewFingerprint: '0'.repeat(64),
          consentVersion: 'membership-renewal-v1',
          consentAccepted: true,
          channel: PaymentChannel.POS,
        },
        actor,
      ),
    ).rejects.toThrow(ConflictException);
    expect(finance.recordPayment).not.toHaveBeenCalled();
  });
});
