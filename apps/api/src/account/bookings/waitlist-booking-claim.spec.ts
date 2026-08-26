import { Types, type ClientSession } from 'mongoose';
import type { BookingDocument } from '../../schemas/booking.schema';
import { BookingsService } from './bookings.service';

jest.mock('../../common/payment', () => ({
  PaymentGatewayService: class PaymentGatewayService {},
}));

describe('BookingsService waitlist claim', () => {
  it('creates the booking and marks the offer claimed in one transaction', async () => {
    const session = {} as ClientSession;
    const waitlistId = new Types.ObjectId().toString();
    const entryId = new Types.ObjectId().toString();
    const athleteId = new Types.ObjectId().toString();
    const clubId = new Types.ObjectId().toString();
    const slotId = new Types.ObjectId().toString();
    const waitlistDocument = { _id: new Types.ObjectId() };
    const booking = {
      _id: new Types.ObjectId(),
      status: 'awaiting_payment',
    } as unknown as BookingDocument;
    const transactions = {
      run: jest.fn(
        async (work: (transactionSession: ClientSession) => unknown) =>
          work(session),
      ),
    };
    const waitlist = {
      claimContextInSession: jest.fn().mockResolvedValue({
        waitlist: waitlistDocument,
        clubId,
        slotId,
        occurrenceDate: '2026-09-01',
        alreadyClaimed: false,
      }),
      markClaimedInSession: jest.fn().mockResolvedValue(undefined),
      recordClaimAudit: jest.fn(),
    };
    const createClubBooking = {
      execute: jest.fn().mockResolvedValue({ bookings: [booking] }),
    };
    const projector = {
      projectMany: jest
        .fn()
        .mockResolvedValue([
          { id: booking._id.toString(), status: 'awaiting_payment' },
        ]),
    };
    const service = new BookingsService(
      null as never,
      null as never,
      null as never,
      null as never,
      null as never,
      null as never,
      null as never,
      null as never,
      transactions as never,
      null as never,
      null as never,
      createClubBooking as never,
      null as never,
      null as never,
      waitlist as never,
      projector as never,
      null as never,
    );

    const result = await service.claimWaitlistOffer(
      athleteId,
      waitlistId,
      entryId,
    );

    expect(createClubBooking.execute).toHaveBeenCalledWith(
      athleteId,
      {
        clubId,
        slotId,
        dates: ['2026-09-01'],
        attendeeCount: 1,
        idempotencyKey: `waitlist:${entryId}`,
      },
      { session },
    );
    expect(waitlist.markClaimedInSession).toHaveBeenCalledWith(
      waitlistDocument,
      entryId,
      session,
    );
    expect(createClubBooking.execute.mock.invocationCallOrder[0]).toBeLessThan(
      waitlist.markClaimedInSession.mock.invocationCallOrder[0],
    );
    expect(waitlist.recordClaimAudit).toHaveBeenCalledWith(
      athleteId,
      waitlistId,
      entryId,
      booking._id.toString(),
      undefined,
    );
    expect(result.bookings[0]?.id).toBe(booking._id.toString());
  });
});
