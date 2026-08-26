import { Types } from 'mongoose';
import { MembershipStatus } from '../common/enums';
import { ClubBroadcastAudience } from '../schemas/club-broadcast.schema';
import { LifecycleService } from './lifecycle.service';

describe('LifecycleService club broadcasts', () => {
  it('stores campaign and one Outbox notification per distinct recipient in one transaction', async () => {
    const session = { id: 'session-1' };
    const clubId = new Types.ObjectId();
    const ownerId = new Types.ObjectId();
    const recipientA = new Types.ObjectId();
    const recipientB = new Types.ObjectId();
    const broadcastId = new Types.ObjectId();
    const findOne = jest.fn().mockImplementation(() => ({
      session: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    }));
    const broadcastModel = {
      findOne,
      create: jest.fn().mockResolvedValue([
        {
          _id: broadcastId,
          toObject: () => ({
            _id: broadcastId,
            clubId,
            title: 'تعطیلی',
            body: 'باشگاه جمعه تعطیل است.',
            audience: ClubBroadcastAudience.ACTIVE_MEMBERS,
            status: 'queued',
            recipientCount: 2,
            createdAt: new Date('2026-08-26T08:00:00.000Z'),
          }),
        },
      ]),
    };
    const membershipModel = {
      aggregate: jest.fn().mockReturnValue({
        session: jest
          .fn()
          .mockResolvedValue([{ _id: recipientA }, { _id: recipientB }]),
      }),
    };
    const clubModel = {
      exists: jest.fn().mockReturnValue({
        session: jest.fn().mockResolvedValue(true),
      }),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue({}) };
    const transactions = {
      run: jest.fn((callback: (value: unknown) => unknown) =>
        callback(session),
      ),
    };
    const service = new LifecycleService(
      {} as never,
      {} as never,
      membershipModel as never,
      clubModel as never,
      {} as never,
      broadcastModel as never,
      outbox as never,
      transactions as never,
    );

    const result = await service.createBroadcast(
      ownerId.toString(),
      clubId.toString(),
      {
        title: 'تعطیلی',
        body: 'باشگاه جمعه تعطیل است.',
        audience: ClubBroadcastAudience.ACTIVE_MEMBERS,
        idempotencyKey: 'broadcast-attempt-1',
      },
    );

    expect(result.recipientCount).toBe(2);
    expect(membershipModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          clubId,
          'holder.userId': { $type: 'objectId' },
          status: MembershipStatus.ACTIVE,
        },
      },
      { $group: { _id: '$holder.userId' } },
      { $limit: 501 },
    ]);
    expect(outbox.enqueue).toHaveBeenCalledTimes(2);
    expect(outbox.enqueue).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        idempotencyKey: `broadcast:${broadcastId.toString()}:${recipientA.toString()}`,
      }),
      session,
    );
    expect(outbox.enqueue).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        idempotencyKey: `broadcast:${broadcastId.toString()}:${recipientB.toString()}`,
      }),
      session,
    );
    expect(transactions.run).toHaveBeenCalledTimes(1);
  });
});
