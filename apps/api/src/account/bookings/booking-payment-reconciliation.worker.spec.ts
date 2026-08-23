import { Types } from 'mongoose';
import { BookingStatus } from '../../common/enums';
import { BookingPaymentReconciliationWorker } from './booking-payment-reconciliation.worker';

function findQuery(result: unknown[]) {
  return {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
}

describe('BookingPaymentReconciliationWorker', () => {
  it('recovers a captured booking when its callback was lost', async () => {
    const booking = {
      _id: new Types.ObjectId(),
      athleteId: new Types.ObjectId(),
      status: BookingStatus.AWAITING_PAYMENT,
      payment: { authority: 'authority-1', initiatedAt: new Date(0) },
    };
    const bookingModel = {
      find: jest.fn().mockReturnValue(findQuery([booking])),
      updateOne: jest.fn(),
    };
    const verify = { execute: jest.fn().mockResolvedValue(booking) };
    const worker = new BookingPaymentReconciliationWorker(
      bookingModel as never,
      verify as never,
      {} as never,
    );

    await expect(worker.reconcilePending()).resolves.toEqual({
      scanned: 1,
      captured: 1,
      unresolved: 0,
    });
    expect(verify.execute).toHaveBeenCalledWith(
      booking.athleteId.toString(),
      booking,
      { authority: 'authority-1', status: 'OK' },
    );
    expect(bookingModel.updateOne).not.toHaveBeenCalled();
  });

  it('throttles unresolved authorities by recording the failed attempt', async () => {
    const booking = {
      _id: new Types.ObjectId(),
      athleteId: new Types.ObjectId(),
      status: BookingStatus.AWAITING_PAYMENT,
      payment: { authority: 'authority-2', initiatedAt: new Date(0) },
    };
    const bookingModel = {
      find: jest.fn().mockReturnValue(findQuery([booking])),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const verify = {
      execute: jest.fn().mockRejectedValue(new Error('unpaid')),
    };
    const worker = new BookingPaymentReconciliationWorker(
      bookingModel as never,
      verify as never,
      {} as never,
    );

    await expect(worker.reconcilePending()).resolves.toMatchObject({
      scanned: 1,
      captured: 0,
      unresolved: 1,
    });
    expect(bookingModel.updateOne).toHaveBeenCalledWith(
      { _id: booking._id, status: BookingStatus.AWAITING_PAYMENT },
      expect.objectContaining({
        $inc: { 'payment.reconciliationAttempts': 1 },
      }),
    );
  });
});
