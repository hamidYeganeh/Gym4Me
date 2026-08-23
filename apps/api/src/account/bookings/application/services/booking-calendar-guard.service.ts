import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type ClientSession } from 'mongoose';
import { BookingStatus } from '../../../../common/enums';
import {
  Booking,
  type BookingDocument,
} from '../../../../schemas/booking.schema';
import {
  CoachProfile,
  type CoachProfileDocument,
} from '../../../../schemas/coach-profile.schema';
import {
  ClubClass,
  type ClubClassDocument,
} from '../../../../schemas/club-class.schema';
import {
  ClubSlot,
  type ClubSlotDocument,
} from '../../../../schemas/club-slot.schema';
import {
  ClubSpace,
  type ClubSpaceDocument,
} from '../../../../schemas/club-space.schema';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';

const OCCUPYING_STATUSES = [
  BookingStatus.PENDING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
];

type AllowedSharedOccurrence = {
  resourceRefId: Types.ObjectId;
  occurrenceDate: string;
};

@Injectable()
export class BookingCalendarGuard {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(ClubSlot.name)
    private readonly clubSlotModel: Model<ClubSlotDocument>,
    @InjectModel(ClubClass.name)
    private readonly clubClassModel: Model<ClubClassDocument>,
    @InjectModel(ClubSpace.name)
    private readonly clubSpaceModel: Model<ClubSpaceDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
  ) {}

  /**
   * Updating the coach profile serializes all booking mutations for that coach.
   * A transaction retry therefore re-reads overlaps committed by its winner.
   */
  async lockAndAssertCoachAvailable(
    coachUserId: Types.ObjectId,
    startsAt: Date,
    endsAt: Date,
    session: ClientSession,
    options?: {
      excludeBookingId?: Types.ObjectId;
      allowedSharedOccurrence?: AllowedSharedOccurrence;
    },
  ): Promise<void> {
    await this.lockCoachCalendar(coachUserId, session);

    const filter: Record<string, unknown> = {
      coachUserId,
      status: { $in: OCCUPYING_STATUSES },
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
    };
    if (options?.excludeBookingId) {
      filter._id = { $ne: options.excludeBookingId };
    }
    if (options?.allowedSharedOccurrence) {
      filter.$nor = [
        {
          'resource.refId': options.allowedSharedOccurrence.resourceRefId,
          'occurrence.date': options.allowedSharedOccurrence.occurrenceDate,
        },
      ];
    }

    const overlap = await this.bookingModel
      .findOne(filter)
      .select({ _id: 1 })
      .session(session);
    if (overlap) {
      throw new ConflictException('Coach already has an overlapping booking');
    }
  }

  async lockCoachCalendar(
    coachUserId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const locked = await this.coachModel.updateOne(
      { userId: coachUserId },
      { $inc: { calendarRevision: 1 } },
      { session },
    );
    if (locked.matchedCount !== 1) {
      throw new ConflictException('Coach calendar is unavailable');
    }
  }

  async lockAndAssertClubResourceAvailable(
    resource: {
      clubId: Types.ObjectId;
      slotId: Types.ObjectId;
      classId?: Types.ObjectId;
      spaceId?: Types.ObjectId;
    },
    occurrenceDate: string,
    startsAt: Date,
    endsAt: Date,
    session: ClientSession,
    excludeBookingId?: Types.ObjectId,
  ): Promise<void> {
    await this.lockClubCalendar(resource.clubId, session);
    const slotLock = await this.clubSlotModel.updateOne(
      { _id: resource.slotId },
      { $inc: { calendarRevision: 1 } },
      { session },
    );
    if (slotLock.matchedCount !== 1) {
      throw new ConflictException('Club slot calendar is unavailable');
    }

    let identityFilter: Record<string, unknown> = {
      'resource.refId': resource.slotId,
    };
    if (resource.classId) {
      const lock = await this.clubClassModel.updateOne(
        { _id: resource.classId },
        { $inc: { calendarRevision: 1 } },
        { session },
      );
      if (lock.matchedCount !== 1) {
        throw new ConflictException('Class calendar is unavailable');
      }
      identityFilter = { classId: resource.classId };
    } else if (resource.spaceId) {
      const lock = await this.clubSpaceModel.updateOne(
        { _id: resource.spaceId },
        { $inc: { calendarRevision: 1 } },
        { session },
      );
      if (lock.matchedCount !== 1) {
        throw new ConflictException('Space calendar is unavailable');
      }
      identityFilter = { spaceId: resource.spaceId };
    }

    const filter: Record<string, unknown> = {
      ...identityFilter,
      status: { $in: OCCUPYING_STATUSES },
      startsAt: { $lt: endsAt },
      endsAt: { $gt: startsAt },
      $nor: [
        {
          'resource.refId': resource.slotId,
          'occurrence.date': occurrenceDate,
        },
      ],
    };
    if (excludeBookingId) filter._id = { $ne: excludeBookingId };
    const overlap = await this.bookingModel
      .findOne(filter)
      .select({ _id: 1 })
      .session(session);
    if (overlap) {
      throw new ConflictException(
        'Selected club resource already has an overlapping booking',
      );
    }
  }

  async lockClubCalendar(
    clubId: Types.ObjectId,
    session: ClientSession,
  ): Promise<void> {
    const locked = await this.clubModel.updateOne(
      { _id: clubId },
      { $inc: { calendarRevision: 1 } },
      { session },
    );
    if (locked.matchedCount !== 1) {
      throw new ConflictException('Club calendar is unavailable');
    }
  }
}
