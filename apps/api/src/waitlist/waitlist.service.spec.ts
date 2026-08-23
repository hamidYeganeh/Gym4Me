import { ConflictException } from '@nestjs/common';
import { Types, type ClientSession } from 'mongoose';
import { WaitlistEntryStatus } from '../common/enums';
import type { WaitlistDocument } from '../schemas/waitlist.schema';
import { WaitlistService } from './waitlist.service';

function queryResult<T>(value: T) {
  return { session: jest.fn().mockResolvedValue(value) };
}

describe('WaitlistService state machine', () => {
  const session = {} as ClientSession;
  const userId = new Types.ObjectId();
  const clubId = new Types.ObjectId();
  const entryId = new Types.ObjectId();

  function document(status: WaitlistEntryStatus, expiresAt?: Date) {
    return {
      _id: new Types.ObjectId(),
      resource: { type: 'slot', id: new Types.ObjectId() },
      clubId,
      occurrenceDate: '2026-09-01',
      entries: [
        {
          _id: entryId,
          userId,
          priority: 1,
          status,
          joinedAt: new Date('2026-08-23T09:00:00.000Z'),
          offeredAt: new Date('2026-08-23T09:30:00.000Z'),
          offerExpiresAt: expiresAt,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as WaitlistDocument;
  }

  function setup(doc: WaitlistDocument) {
    const model = {
      findById: jest.fn().mockReturnValue(queryResult(doc)),
    };
    const staff = {
      requireClubAccess: jest.fn().mockResolvedValue(undefined),
      assertStaffPermission: jest.fn().mockResolvedValue(undefined),
    };
    const audit = { log: jest.fn() };
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const service = new WaitlistService(
      model as never,
      staff as never,
      audit as never,
      transactions as never,
      outbox as never,
    );
    return { audit, outbox, service, staff, transactions };
  }

  it('persists expiry before returning an expired-offer conflict', async () => {
    const doc = document(
      WaitlistEntryStatus.OFFERED,
      new Date('2026-08-23T09:45:00.000Z'),
    );
    const { service } = setup(doc);
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T10:00:00.000Z'));

    await expect(
      service.claim(userId.toString(), doc._id.toString(), {
        entryId: entryId.toString(),
      }),
    ).rejects.toThrow('Offer has expired');
    expect(doc.entries[0]?.status).toBe(WaitlistEntryStatus.EXPIRED);
    expect(doc.save).toHaveBeenCalledWith({ session });
    jest.useRealTimers();
  });

  it('allows exactly one claim side effect for repeated requests', async () => {
    const doc = document(
      WaitlistEntryStatus.OFFERED,
      new Date(Date.now() + 60_000),
    );
    const { audit, service } = setup(doc);

    await service.claim(userId.toString(), doc._id.toString(), {
      entryId: entryId.toString(),
    });
    await expect(
      service.claim(userId.toString(), doc._id.toString(), {
        entryId: entryId.toString(),
      }),
    ).rejects.toThrow(ConflictException);
    expect(doc.entries[0]?.status).toBe(WaitlistEntryStatus.CLAIMED);
    expect(audit.log).toHaveBeenCalledTimes(1);
  });

  it('does not create a second offer while one is active', async () => {
    const doc = document(WaitlistEntryStatus.WAITING);
    const { outbox, service } = setup(doc);

    await service.offer(
      new Types.ObjectId().toString(),
      clubId.toString(),
      doc._id.toString(),
      {},
    );
    await expect(
      service.offer(
        new Types.ObjectId().toString(),
        clubId.toString(),
        doc._id.toString(),
        {},
      ),
    ).rejects.toThrow('active waitlist offer');
    expect(outbox.enqueue).toHaveBeenCalledTimes(1);
  });
});
