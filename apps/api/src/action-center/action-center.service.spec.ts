import { Types } from 'mongoose';
import { Role } from '../common/enums';
import { ActionCenterService } from './action-center.service';

function query(result: unknown) {
  const chain = {
    sort: jest.fn(),
    select: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn().mockResolvedValue(result),
  };
  chain.sort.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  return chain;
}

describe('ActionCenterService', () => {
  it('returns only the three highest-priority athlete actions', async () => {
    const bookingId = new Types.ObjectId();
    const workoutId = new Types.ObjectId();
    const planId = new Types.ObjectId();
    const membershipId = new Types.ObjectId();
    const upcomingId = new Types.ObjectId();
    const bookings = {
      findOne: jest
        .fn()
        .mockReturnValueOnce(
          query({
            _id: bookingId,
            code: 'G4M-1',
            paymentExpiresAt: new Date('2026-08-26T10:00:00.000Z'),
          }),
        )
        .mockReturnValueOnce(
          query({
            _id: upcomingId,
            startsAt: new Date('2026-08-27T10:00:00.000Z'),
          }),
        ),
    };
    const workouts = {
      findOne: jest
        .fn()
        .mockReturnValue(
          query({ _id: workoutId, planId, status: 'in_progress' }),
        ),
    };
    const memberships = {
      findOne: jest.fn().mockReturnValue(
        query({
          _id: membershipId,
          clubId: new Types.ObjectId(),
          credit: { remainingSessions: 1 },
        }),
      ),
    };
    const events = { track: jest.fn().mockResolvedValue(undefined) };
    const service = new ActionCenterService(
      bookings as never,
      memberships as never,
      workouts as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      events as never,
    );

    const result = await service.get(
      new Types.ObjectId().toString(),
      Role.ATHLETE,
    );

    expect(result.items.map((item) => item.kind)).toEqual([
      'athlete.booking_payment',
      'athlete.workout_resume',
      'athlete.membership_renew',
    ]);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]?.href).toBe(
      `/athlete/bookings/${bookingId.toString()}`,
    );
    expect(events.track).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'action_center_viewed' }),
    );
  });

  it('does not expose owner resources outside owned clubs', async () => {
    const clubs = { find: jest.fn().mockReturnValue(query([])) };
    const debts = { countDocuments: jest.fn() };
    const tasks = { countDocuments: jest.fn() };
    const service = new ActionCenterService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      clubs as never,
      debts as never,
      tasks as never,
      { track: jest.fn().mockResolvedValue(undefined) } as never,
    );

    const result = await service.get(
      new Types.ObjectId().toString(),
      Role.CLUB_OWNER,
    );

    expect(result.items[0]?.kind).toBe('owner.create_club');
    expect(debts.countDocuments).not.toHaveBeenCalled();
    expect(tasks.countDocuments).not.toHaveBeenCalled();
  });

  it('rejects click analytics for another role', () => {
    const events = { track: jest.fn() };
    const service = new ActionCenterService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      events as never,
    );

    expect(() =>
      service.click(new Types.ObjectId().toString(), Role.COACH, {
        itemId: 'owner-debts',
        kind: 'owner.debts',
      }),
    ).toThrow('action_center.kind_not_allowed');
    expect(events.track).not.toHaveBeenCalled();
  });
});
