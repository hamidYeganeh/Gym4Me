import { BadRequestException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import {
  AuditAction,
  EntityStatus,
  MembershipActorKind,
  MembershipEventType,
  MembershipPlanKind,
  MembershipStatus,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
} from '../../../../common/enums';
import type { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import type { ClubMembershipDocument } from '../../../../schemas/club-membership.schema';
import { SellMembershipCommand } from './sell-membership.command';

function sessionQuery<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

function optionalSessionQuery<T>(value: T) {
  const query = Promise.resolve(value) as Promise<T> & {
    session: jest.Mock;
  };
  query.session = jest.fn().mockResolvedValue(value);
  return query;
}

describe('SellMembershipCommand', () => {
  const clubId = new Types.ObjectId().toString();
  const planId = new Types.ObjectId().toString();
  const actor = {
    userId: new Types.ObjectId().toString(),
    kind: MembershipActorKind.OWNER,
  };
  const holderUserId = new Types.ObjectId().toString();
  const session = {} as ClientSession;
  const dto = { planId, holder: { userId: holderUserId } };

  function setup(options?: { amount?: number; kind?: MembershipPlanKind }) {
    const membershipInstances: Array<ClubMembershipDocument> = [];
    const membershipModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const instance = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as ClubMembershipDocument;
        membershipInstances.push(instance);
        return instance;
      }),
      { findOne: jest.fn().mockReturnValue(optionalSessionQuery(null)) },
    );
    const plan = {
      _id: new Types.ObjectId(planId),
      status: EntityStatus.ACTIVE,
      kind: options?.kind ?? MembershipPlanKind.SESSIONS,
      sessionsTotal: 12,
      pricing: { amount: options?.amount ?? 0, tax: 90 },
    };
    const planModel = {
      findOne: jest.fn().mockReturnValue(sessionQuery(plan)),
    };
    const eventInstances: Array<Record<string, unknown>> = [];
    const eventModel = jest
      .fn()
      .mockImplementation((input: Record<string, unknown>) => {
        const instance = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        };
        eventInstances.push(instance);
        return instance;
      });
    const audit = { log: jest.fn() };
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
      redeem: jest.fn().mockResolvedValue({ discount: 100 }),
    };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const command = new SellMembershipCommand(
      planModel as never,
      membershipModel as never,
      eventModel as never,
      audit as never,
      finance as never,
      coupons as never,
      transactions as unknown as MongoTransactionService,
      outbox as never,
    );
    return {
      audit,
      command,
      coupons,
      debtId,
      eventInstances,
      finance,
      membershipInstances,
      membershipModel,
      outbox,
      paymentId,
      paymentResult,
      plan,
      planModel,
      transactions,
    };
  }

  it('returns an idempotent replay before validating or opening a transaction', async () => {
    const existing = { _id: new Types.ObjectId() } as ClubMembershipDocument;
    const { audit, command, membershipModel, planModel, transactions } =
      setup();
    membershipModel.findOne.mockResolvedValue(existing);

    await expect(
      command.execute(
        clubId,
        {
          planId,
          holder: {},
          idempotencyKey: 'membership-retry-1',
        },
        actor,
      ),
    ).resolves.toBe(existing);
    expect(planModel.findOne).not.toHaveBeenCalled();
    expect(transactions.run).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalled();
  });

  it('rejects a missing holder before opening a transaction', async () => {
    const { command, transactions } = setup();

    await expect(
      command.execute(clubId, { planId, holder: {} }, actor),
    ).rejects.toThrow(BadRequestException);
    expect(transactions.run).not.toHaveBeenCalled();
  });

  it('creates a free membership and SOLD event in the same session', async () => {
    const {
      audit,
      command,
      eventInstances,
      finance,
      membershipInstances,
      outbox,
    } = setup();

    const result = await command.execute(clubId, dto, actor);

    expect(result).toBe(membershipInstances[0]);
    expect(result).toMatchObject({
      clubId: new Types.ObjectId(clubId),
      planId: new Types.ObjectId(planId),
      holder: { userId: new Types.ObjectId(holderUserId) },
      status: MembershipStatus.ACTIVE,
      credit: { remainingSessions: 12 },
      soldBy: new Types.ObjectId(actor.userId),
    });
    expect(result.save).toHaveBeenCalledWith({ session });
    expect(eventInstances[0]).toMatchObject({
      membershipId: result._id,
      type: MembershipEventType.SOLD,
      actor: {
        userId: new Types.ObjectId(actor.userId),
        kind: actor.kind,
      },
    });
    expect(eventInstances[0]?.save).toHaveBeenCalledWith({ session });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'membership.sold',
        payload: expect.objectContaining({
          membershipId: result._id.toString(),
          clubId,
          planId,
        }),
      }),
      session,
    );
    expect(finance.recordPayment).not.toHaveBeenCalled();
    expect(finance.createDebt).not.toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.MEMBERSHIP_SOLD,
        actorId: actor.userId,
        targetUserId: holderUserId,
      }),
    );
  });

  it('commits coupon, partial payment, debt and event before post-commit effects', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));
    const {
      audit,
      command,
      coupons,
      debtId,
      finance,
      membershipInstances,
      paymentId,
      paymentResult,
      transactions,
    } = setup({ amount: 1_000 });

    const result = await command.execute(
      clubId,
      {
        ...dto,
        idempotencyKey: 'membership-sale-1',
        couponCode: 'SAVE100',
        paidAmount: 500,
        channel: PaymentChannel.CASH,
      },
      actor,
    );

    expect(coupons.redeem).toHaveBeenCalledWith(
      'SAVE100',
      expect.objectContaining({
        userId: holderUserId,
        clubId,
        amount: 1_000,
      }),
      session,
    );
    expect(finance.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: PaymentPurpose.MEMBERSHIP,
        channel: PaymentChannel.CASH,
        status: PaymentStatus.CAPTURED,
        amount: { gross: 500 },
        idempotencyKey: 'membership-sale-1',
      }),
      {
        actorId: actor.userId,
        operatorUserId: actor.userId,
        request: undefined,
        session,
      },
    );
    expect(finance.createDebt).toHaveBeenCalledWith(
      clubId,
      expect.objectContaining({
        membershipId: result._id.toString(),
        principal: 400,
        dueAt: '2026-09-22T10:00:00.000Z',
      }),
      session,
    );
    expect(result.paymentId).toEqual(paymentId);
    expect(membershipInstances[0]?.save).toHaveBeenCalledTimes(2);
    expect(finance.runPaymentPostCommitEffects).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: 'membership-sale-1' }),
      expect.objectContaining({
        actorId: actor.userId,
        operatorUserId: actor.userId,
      }),
      paymentResult,
    );
    expect(
      finance.runPaymentPostCommitEffects.mock.invocationCallOrder[0],
    ).toBeGreaterThan(transactions.run.mock.invocationCallOrder[0]);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          paymentId: paymentId.toString(),
          debtId: debtId.toString(),
        }),
      }),
    );
    jest.useRealTimers();
  });

  it('rejects paid athlete checkout before creating a membership or captured payment', async () => {
    const { command, finance, membershipInstances } = setup({ amount: 1_000 });

    await expect(
      command.execute(
        clubId,
        { ...dto, channel: PaymentChannel.ZARINPAL },
        { ...actor, kind: MembershipActorKind.ATHLETE },
      ),
    ).rejects.toThrow(
      'Online membership checkout requires a verified payment intent',
    );
    expect(membershipInstances).toHaveLength(0);
    expect(finance.recordPayment).not.toHaveBeenCalled();
  });

  it('rejects unverified external payment ids and online desk channels', async () => {
    const suppliedPayment = setup({ amount: 1_000 });
    await expect(
      suppliedPayment.command.execute(
        clubId,
        { ...dto, paymentId: new Types.ObjectId().toString() },
        actor,
      ),
    ).rejects.toThrow(
      'Externally supplied membership paymentId is not accepted',
    );
    expect(suppliedPayment.membershipInstances).toHaveLength(0);

    const onlineDesk = setup({ amount: 1_000 });
    await expect(
      onlineDesk.command.execute(
        clubId,
        { ...dto, channel: PaymentChannel.WALLET },
        actor,
      ),
    ).rejects.toThrow(
      'Desk sale requires cash, POS, card-to-card or mixed payment',
    );
    expect(onlineDesk.membershipInstances).toHaveLength(0);
  });

  it('returns the winning record after a duplicate-key race', async () => {
    const existing = { _id: new Types.ObjectId() } as ClubMembershipDocument;
    const { audit, command, membershipModel, transactions } = setup();
    membershipModel.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existing);
    transactions.run.mockRejectedValueOnce(
      Object.assign(new Error('duplicate'), { code: 11000 }),
    );

    await expect(
      command.execute(
        clubId,
        { ...dto, idempotencyKey: 'membership-race-1' },
        actor,
      ),
    ).resolves.toBe(existing);
    expect(audit.log).not.toHaveBeenCalled();
  });
});
