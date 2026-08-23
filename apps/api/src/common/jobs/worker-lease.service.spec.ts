/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { WorkerLeaseService } from './worker-lease.service';

describe('WorkerLeaseService', () => {
  function setup() {
    const leaseModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ key: 'job' }),
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    return {
      leaseModel,
      service: new WorkerLeaseService(leaseModel as never),
    };
  }

  it('treats a unique-key upsert race as a busy distributed lease', async () => {
    const { leaseModel, service } = setup();
    leaseModel.findOneAndUpdate.mockRejectedValueOnce({ code: 11000 });

    await expect(service.tryAcquire('booking-expiry', 60_000)).resolves.toBe(
      false,
    );
  });

  it('reclaims only expired leases and records successful completion', async () => {
    const { leaseModel, service } = setup();
    const result = await service.runExclusive('booking-expiry', () =>
      Promise.resolve(7),
    );

    expect(result).toEqual({ acquired: true, result: 7 });
    expect(leaseModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'booking-expiry',
        $or: expect.arrayContaining([
          expect.objectContaining({ leaseUntil: expect.any(Object) }),
        ]),
      }),
      expect.any(Object),
      expect.objectContaining({ upsert: true, new: true }),
    );
    expect(leaseModel.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'booking-expiry',
        ownerId: service.instanceId,
      }),
      expect.objectContaining({
        $set: expect.objectContaining({ lastCompletedAt: expect.any(Date) }),
      }),
    );
  });

  it('does not execute work when another instance owns the lease', async () => {
    const { leaseModel, service } = setup();
    leaseModel.findOneAndUpdate.mockRejectedValueOnce({ code: 11000 });
    const work = jest.fn().mockResolvedValue(undefined);

    await expect(
      service.runExclusive('waitlist-expiry', work),
    ).resolves.toEqual({ acquired: false });
    expect(work).not.toHaveBeenCalled();
  });
});
