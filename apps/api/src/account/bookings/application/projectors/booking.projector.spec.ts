import { Types } from 'mongoose';
import {
  BookingResourceType,
  BookingStatus,
  ConsultationKind,
} from '../../../../common/enums';
import type { BookingDocument } from '../../../../schemas/booking.schema';
import { BookingProjector } from './booking.projector';

function selectableList<T>(value: T[]) {
  return { select: jest.fn().mockResolvedValue(value) };
}

describe('BookingProjector', () => {
  const athleteId = new Types.ObjectId();
  const coachId = new Types.ObjectId();
  const clubId = new Types.ObjectId();
  const slotId = new Types.ObjectId();

  function coachBooking() {
    return {
      _id: new Types.ObjectId(),
      athleteId,
      coachUserId: coachId,
      clubId,
      slotId,
      code: 'BK-COACH',
      status: BookingStatus.PENDING,
      resource: { type: BookingResourceType.COACH, refId: slotId },
      consultationKind: ConsultationKind.IN_PERSON,
      startsAt: new Date('2026-09-01T07:30:00.000Z'),
      endsAt: new Date('2026-09-01T08:30:00.000Z'),
      intake: {
        note: 'note',
        medicalConditionKeys: ['knee'],
        supplementKeys: [],
      },
      pricing: { amount: 100_000, discount: 0, total: 100_000 },
      createdAt: new Date('2026-08-23T10:00:00.000Z'),
      updatedAt: new Date('2026-08-23T10:00:00.000Z'),
    } as BookingDocument;
  }

  function setup() {
    const users = [
      {
        _id: athleteId,
        name: { first: 'علی', last: 'ورزشکار' },
        avatar: {},
        code: 'ATH-1',
      },
      {
        _id: coachId,
        name: { first: 'مریم', last: 'مربی' },
        avatar: { mediaId: new Types.ObjectId() },
        code: 'COACH-1',
      },
    ];
    const userModel = {
      find: jest.fn().mockReturnValue(selectableList(users)),
    };
    const clubModel = {
      find: jest.fn().mockReturnValue(
        selectableList([
          {
            _id: clubId,
            identity: { name: 'باشگاه تست' },
            location: { address: 'تهران' },
          },
        ]),
      ),
    };
    const classModel = { find: jest.fn().mockResolvedValue([]) };
    const spaceModel = { find: jest.fn().mockResolvedValue([]) };
    const clubSlots = { findSlotsByIds: jest.fn().mockResolvedValue([]) };
    const projector = new BookingProjector(
      userModel as never,
      clubModel as never,
      classModel as never,
      spaceModel as never,
      clubSlots as never,
    );
    return {
      classModel,
      clubModel,
      clubSlots,
      projector,
      spaceModel,
      userModel,
      users,
    };
  }

  it('shows the coach to athletes and keeps provider-only athlete data absent', async () => {
    const { projector } = setup();

    const result = await projector.project(coachBooking(), 'athlete');

    expect(result).toMatchObject({
      code: 'BK-COACH',
      athleteId: athleteId.toString(),
      coachUserId: coachId.toString(),
      coach: {
        id: coachId.toString(),
        name: { first: 'مریم', last: 'مربی' },
        code: 'COACH-1',
      },
      club: {
        id: clubId.toString(),
        name: 'باشگاه تست',
        address: 'تهران',
      },
      resource: {
        type: BookingResourceType.COACH,
        refId: slotId.toString(),
        title: null,
        coverMediaId: null,
      },
      attendeeCount: 1,
      payment: null,
      cancellation: null,
    });
    expect(result?.athlete).toBeUndefined();
  });

  it('shows the athlete counterpart to coach, club and admin audiences', async () => {
    const { projector } = setup();

    for (const audience of ['coach', 'club', 'admin'] as const) {
      const result = await projector.project(coachBooking(), audience);
      expect(result?.athlete).toMatchObject({
        id: athleteId.toString(),
        name: { first: 'علی', last: 'ورزشکار' },
        code: 'ATH-1',
      });
      expect(result?.coach).toBeUndefined();
    }
  });

  it('resolves class display metadata for a bounded club-booking batch', async () => {
    const classId = new Types.ObjectId();
    const coverMediaId = new Types.ObjectId();
    const booking = {
      ...coachBooking(),
      coachUserId: undefined,
      slotId: undefined,
      consultationKind: undefined,
      resource: { type: BookingResourceType.CLASS, refId: slotId },
      occurrence: {
        date: '2026-09-01',
        startTime: '11:00',
        endTime: '12:00',
      },
    } as BookingDocument;
    const { classModel, clubSlots, projector } = setup();
    clubSlots.findSlotsByIds.mockResolvedValue([
      { _id: slotId, classId, spaceId: undefined },
    ]);
    classModel.find.mockResolvedValue([
      { _id: classId, title: 'یوگا', media: { coverMediaId } },
    ]);

    const [result] = await projector.projectMany([booking], 'athlete');

    expect(clubSlots.findSlotsByIds).toHaveBeenCalledWith([slotId.toString()]);
    expect(result.resource).toEqual({
      type: BookingResourceType.CLASS,
      refId: slotId.toString(),
      title: 'یوگا',
      coverMediaId: coverMediaId.toString(),
    });
    expect(result.occurrence).toEqual(booking.occurrence);
  });

  it('does not query enrichment collections for an empty batch', async () => {
    const { clubModel, clubSlots, projector, userModel } = setup();

    await expect(projector.projectMany([], 'admin')).resolves.toEqual([]);
    expect(userModel.find).not.toHaveBeenCalled();
    expect(clubModel.find).not.toHaveBeenCalled();
    expect(clubSlots.findSlotsByIds).not.toHaveBeenCalled();
  });
});
