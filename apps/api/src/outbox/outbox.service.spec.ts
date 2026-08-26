/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import { OutboxMessageStatus } from '../common/enums';
import { OutboxService } from './outbox.service';

function outboxMessage(attempts = 1) {
  const now = new Date();
  return {
    _id: new Types.ObjectId(),
    eventName: 'booking.confirmed',
    payload: {
      clubId: new Types.ObjectId().toString(),
      notification: {
        userId: new Types.ObjectId().toString(),
        templateKey: 'booking.confirmed',
        forceSms: true,
        smsTokens: ['باشگاه', '1405/06/04', '18:00'],
      },
    },
    status: OutboxMessageStatus.PROCESSING,
    attempts,
    replayCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

describe('OutboxService distributed processing', () => {
  function setup(instanceId: string, model?: Record<string, jest.Mock>) {
    const outboxModel =
      model ??
      ({
        findOneAndUpdate: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      } satisfies Record<string, jest.Mock>);
    const notifications = {
      dispatch: jest.fn().mockResolvedValue({
        notificationId: new Types.ObjectId().toString(),
        push: null,
        sms: null,
        deduplicated: false,
      }),
    };
    const clubModel = {
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ ownerId: new Types.ObjectId() }),
      }),
    };
    const entitlements = {
      reserveTransactionalMessage: jest
        .fn()
        .mockResolvedValue({ idempotent: false }),
    };
    const service = new OutboxService(
      outboxModel as never,
      clubModel as never,
      notifications as never,
      { instanceId } as never,
      entitlements as never,
    );
    return { clubModel, entitlements, notifications, outboxModel, service };
  }

  it('allows only one of two workers to deliver one atomically claimed message', async () => {
    const message = outboxMessage();
    const sharedModel = {
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValueOnce(message)
        .mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const first = setup('instance-a', sharedModel);
    const second = setup('instance-b', sharedModel);

    const [left, right] = await Promise.all([
      first.service.publishPending(1),
      second.service.publishPending(1),
    ]);

    expect(left.published + right.published).toBe(1);
    expect(
      first.notifications.dispatch.mock.calls.length +
        second.notifications.dispatch.mock.calls.length,
    ).toBe(1);
  });

  it('claims stale processing messages so a crashed worker is recoverable', async () => {
    const message = outboxMessage();
    const { outboxModel, service } = setup('instance-b');
    outboxModel.findOneAndUpdate
      .mockResolvedValueOnce(message)
      .mockResolvedValue(null);

    await service.publishPending(1);

    expect(outboxModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          expect.objectContaining({
            status: OutboxMessageStatus.PROCESSING,
            $or: expect.arrayContaining([
              expect.objectContaining({ leaseUntil: expect.any(Object) }),
              expect.objectContaining({ leaseUntil: expect.any(Object) }),
            ]),
          }),
        ]),
      }),
      expect.any(Object),
      expect.objectContaining({ new: true }),
    );
  });

  it('dead-letters a poison message on its fifth failed attempt', async () => {
    const message = outboxMessage(5);
    const { notifications, outboxModel, service } = setup('instance-a');
    outboxModel.findOneAndUpdate
      .mockResolvedValueOnce(message)
      .mockResolvedValue(null);
    notifications.dispatch.mockRejectedValueOnce(new Error('poison'));

    await expect(service.publishPending(1)).resolves.toEqual({
      scanned: 1,
      published: 0,
    });
    expect(outboxModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: message._id }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: OutboxMessageStatus.DEAD_LETTER,
          deadLetteredAt: expect.any(Date),
        }),
      }),
    );
  });

  it('retries when notification dispatch was not durably persisted', async () => {
    const message = outboxMessage(1);
    const { notifications, outboxModel, service } = setup('instance-a');
    outboxModel.findOneAndUpdate
      .mockResolvedValueOnce(message)
      .mockResolvedValue(null);
    notifications.dispatch.mockResolvedValueOnce({
      notificationId: null,
      push: null,
      sms: null,
      deduplicated: false,
    });

    await expect(service.publishPending(1)).resolves.toEqual({
      scanned: 1,
      published: 0,
    });
    expect(outboxModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: message._id }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: OutboxMessageStatus.PENDING,
          nextAttemptAt: expect.any(Date),
        }),
      }),
    );
  });

  it('reserves a club transactional-message entitlement before dispatch', async () => {
    const message = outboxMessage();
    const { entitlements, notifications, outboxModel, service } =
      setup('instance-a');
    outboxModel.findOneAndUpdate
      .mockResolvedValueOnce(message)
      .mockResolvedValue(null);

    await expect(service.publishPending(1)).resolves.toEqual({
      scanned: 1,
      published: 1,
    });
    expect(entitlements.reserveTransactionalMessage).toHaveBeenCalledWith({
      ownerUserId: expect.any(String),
      clubId: message.payload.clubId,
      sourceId: message._id.toString(),
    });
    expect(
      entitlements.reserveTransactionalMessage.mock.invocationCallOrder[0],
    ).toBeLessThan(notifications.dispatch.mock.invocationCallOrder[0]);
    expect(notifications.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        forceSms: true,
        smsTokens: ['باشگاه', '1405/06/04', '18:00'],
        idempotencyKey: `outbox:${message._id.toString()}`,
      }),
    );
  });
});
