import { Types, type ClientSession } from 'mongoose';
import {
  MembershipActorKind,
  MembershipEventType,
  MembershipStatus,
  MembershipTransferPolicy,
} from '../../common/enums';
import type { ClubMembershipDocument } from '../../schemas/club-membership.schema';
import { MembershipsService } from './memberships.service';

function sessionQuery<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

describe('MembershipsService lifecycle transaction boundary', () => {
  const session = {} as ClientSession;
  const clubId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const holderId = new Types.ObjectId();
  const actor = {
    userId: new Types.ObjectId().toString(),
    kind: MembershipActorKind.OWNER,
  };

  function setup(status: MembershipStatus) {
    const current = {
      _id: new Types.ObjectId(),
      clubId,
      planId,
      holder: { userId: holderId },
      status,
      credit: { remainingSessions: 4 },
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as ClubMembershipDocument;
    const created: Array<ClubMembershipDocument> = [];
    const membershipModel = Object.assign(
      jest.fn().mockImplementation((input: Record<string, unknown>) => {
        const membership = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        } as unknown as ClubMembershipDocument;
        created.push(membership);
        return membership;
      }),
      {
        findOne: jest.fn().mockReturnValue(sessionQuery(current)),
        findOneAndUpdate: jest.fn().mockResolvedValue(current),
      },
    );
    const planModel = {
      findById: jest.fn().mockReturnValue(
        sessionQuery({
          _id: planId,
          rules: {
            freezeMaxDays: 14,
            transferPolicy: MembershipTransferPolicy.ALLOWED,
          },
        }),
      ),
    };
    const events: Array<Record<string, unknown>> = [];
    const eventModel = jest
      .fn()
      .mockImplementation((input: Record<string, unknown>) => {
        const event = {
          ...input,
          _id: new Types.ObjectId(),
          save: jest.fn().mockResolvedValue(undefined),
        };
        events.push(event);
        return event;
      });
    const audit = { log: jest.fn() };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const service = new MembershipsService(
      {} as never,
      planModel as never,
      membershipModel as never,
      eventModel as never,
      {} as never,
      {} as never,
      {} as never,
      audit as never,
      {} as never,
      {} as never,
      transactions as never,
      outbox as never,
    );
    return {
      audit,
      created,
      current,
      events,
      outbox,
      service,
      transactions,
    };
  }

  it('commits freeze state, immutable event and outbox in one session', async () => {
    const { current, events, outbox, service, transactions } = setup(
      MembershipStatus.ACTIVE,
    );

    await service.freeze(
      current._id.toString(),
      { reason: 'medical' },
      actor,
      clubId.toString(),
    );

    expect(transactions.run).toHaveBeenCalledTimes(1);
    expect(current.status).toBe(MembershipStatus.FROZEN);
    expect(current.save).toHaveBeenCalledWith({ session });
    expect(events[0]).toMatchObject({
      membershipId: current._id,
      type: MembershipEventType.FROZEN,
      reason: 'medical',
    });
    expect(events[0]?.save).toHaveBeenCalledWith({ session });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'membership.frozen' }),
      session,
    );
  });

  it('atomically transfers remaining credit without overwriting the prior holder', async () => {
    const { created, current, events, outbox, service } = setup(
      MembershipStatus.ACTIVE,
    );
    const nextHolderId = new Types.ObjectId();

    const result = await service.transfer(
      current._id.toString(),
      { toHolder: { userId: nextHolderId.toString() }, reason: 'approved' },
      actor,
      clubId.toString(),
    );

    expect(current.status).toBe(MembershipStatus.TRANSFERRED);
    expect(current.holder.userId).toEqual(holderId);
    expect(current.save).toHaveBeenCalledWith({ session });
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      clubId,
      planId,
      holder: { userId: nextHolderId },
      status: MembershipStatus.ACTIVE,
      credit: { remainingSessions: 4 },
    });
    expect(created[0]?.save).toHaveBeenCalledWith({ session });
    expect(events.map((event) => event.type)).toEqual([
      MembershipEventType.TRANSFERRED,
      MembershipEventType.SOLD,
    ]);
    expect(outbox.enqueue).toHaveBeenCalledTimes(2);
    expect(result.previous.holder.userId).toBe(holderId.toString());
    expect(result.membership.holder.userId).toBe(nextHolderId.toString());
  });

  it('commits cancellation state, event and outbox before audit', async () => {
    const { audit, current, events, outbox, service } = setup(
      MembershipStatus.FROZEN,
    );

    await service.cancel(
      current._id.toString(),
      { reason: 'requested' },
      actor,
      clubId.toString(),
    );

    expect(current.status).toBe(MembershipStatus.CANCELLED);
    expect(current.save).toHaveBeenCalledWith({ session });
    expect(events[0]).toMatchObject({ type: MembershipEventType.CANCELLED });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'membership.cancelled' }),
      session,
    );
    expect(audit.log).toHaveBeenCalledTimes(1);
  });

  it('wraps direct credit consumption with event and outbox in one transaction', async () => {
    const { current, events, outbox, service, transactions } = setup(
      MembershipStatus.ACTIVE,
    );

    await service.consumeCredit(
      current._id.toString(),
      { amount: 1, reason: 'desk_check_in' },
      actor,
      clubId.toString(),
    );

    expect(transactions.run).toHaveBeenCalledTimes(1);
    expect(events[0]).toMatchObject({
      type: MembershipEventType.CREDIT_CONSUMED,
      payload: { creditKind: 'sessions', amount: 1 },
    });
    expect(events[0]?.save).toHaveBeenCalledWith({ session });
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'membership.credit_consumed' }),
      session,
    );
  });
});
