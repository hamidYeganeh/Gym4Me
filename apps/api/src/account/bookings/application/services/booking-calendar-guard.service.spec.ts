import { ConflictException } from '@nestjs/common';
import type { ClientSession } from 'mongoose';
import { Types } from 'mongoose';
import { BookingCalendarGuard } from './booking-calendar-guard.service';

function queryResult<T>(value: T) {
  return {
    select: jest.fn().mockReturnThis(),
    session: jest.fn().mockResolvedValue(value),
  };
}

describe('BookingCalendarGuard', () => {
  const session = {} as ClientSession;
  const coachId = new Types.ObjectId();
  const startsAt = new Date('2026-09-01T08:00:00.000Z');
  const endsAt = new Date('2026-09-01T09:00:00.000Z');

  function setup(overlap: unknown = null) {
    const bookingModel = {
      findOne: jest.fn().mockReturnValue(queryResult(overlap)),
    };
    const coachModel = {
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const alwaysLocked = {
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    };
    const guard = new BookingCalendarGuard(
      bookingModel as never,
      coachModel as never,
      alwaysLocked as never,
      alwaysLocked as never,
      alwaysLocked as never,
      alwaysLocked as never,
    );
    return { bookingModel, coachModel, guard };
  }

  it('queries buffered calendar snapshots with a legacy booking fallback', async () => {
    const { bookingModel, guard } = setup();

    await guard.lockAndAssertCoachAvailable(coachId, startsAt, endsAt, session);

    expect(bookingModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          {
            calendarStartsAt: { $lt: endsAt },
            calendarEndsAt: { $gt: startsAt },
          },
          {
            calendarStartsAt: { $exists: false },
            startsAt: { $lt: endsAt },
            endsAt: { $gt: startsAt },
          },
        ],
      }),
    );
  });

  it('rejects a conflicting coach booking after taking the calendar mutex', async () => {
    const { coachModel, guard } = setup({ _id: new Types.ObjectId() });

    await expect(
      guard.lockAndAssertCoachAvailable(coachId, startsAt, endsAt, session),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(coachModel.updateOne).toHaveBeenCalledTimes(1);
  });
});
