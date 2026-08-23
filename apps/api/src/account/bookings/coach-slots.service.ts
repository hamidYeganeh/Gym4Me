import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CalendarResourceType,
  ClubLifecycleStatus,
  ClubOperationalStatus,
  CoachSlotStatus,
  VerificationStatus,
} from '../../common/enums';
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';
import { Club, ClubDocument } from '../../schemas/club.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import { CoachSlot, CoachSlotDocument } from '../../schemas/coach-slot.schema';
import { CoachSlotInputDto } from './dto/coach-slot.dto';
import { CalendarAvailabilityService } from '../calendar/calendar-availability.service';
import { BookingCalendarGuard } from './application/services/booking-calendar-guard.service';

const MAX_RANGE_DAYS = 62;

export type PublicClubRef = {
  id: string;
  name: string;
  address: string | null;
};

@Injectable()
export class CoachSlotsService {
  constructor(
    @InjectModel(CoachSlot.name)
    private readonly slotModel: Model<CoachSlotDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly transactions: MongoTransactionService,
    private readonly calendarAvailability: CalendarAvailabilityService,
    private readonly calendarGuard: BookingCalendarGuard,
  ) {}

  /** Public availability for the discovery reserve flow. */
  async listPublic(coachUserId: string, from: string, to: string) {
    if (!Types.ObjectId.isValid(coachUserId)) {
      throw new NotFoundException('Coach not found');
    }
    const profile = await this.coachModel.findOne({
      userId: new Types.ObjectId(coachUserId),
      'verification.status': VerificationStatus.APPROVED,
    });
    if (!profile) throw new NotFoundException('Coach not found');

    const range = this.parseRange(from, to);
    const slots = await this.slotModel
      .find({
        coachUserId: new Types.ObjectId(coachUserId),
        startsAt: { $gte: range.from, $lte: range.to },
      })
      .sort({ startsAt: 1 });

    const clubById = await this.resolveClubs(slots);

    return {
      pricing: {
        consultation: {
          inPerson: profile.pricing?.consultation?.inPerson ?? null,
          remote: profile.pricing?.consultation?.remote ?? null,
        },
      },
      slots: slots.map((slot) => this.toPublicSlot(slot, clubById)),
    };
  }

  /** Coach's own calendar (includes blocked slots). */
  async listMine(coachUserId: string, from: string, to: string) {
    const range = this.parseRange(from, to);
    const slots = await this.slotModel
      .find({
        coachUserId: new Types.ObjectId(coachUserId),
        startsAt: { $gte: range.from, $lte: range.to },
      })
      .sort({ startsAt: 1 });
    const clubById = await this.resolveClubs(slots);
    return { slots: slots.map((slot) => this.toPublicSlot(slot, clubById)) };
  }

  async createMine(coachUserId: string, inputs: CoachSlotInputDto[]) {
    const now = Date.now();
    const clubIds = new Set<string>();

    const parsed = inputs.map((input) => {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        throw new BadRequestException('Invalid slot dates');
      }
      if (endsAt.getTime() <= startsAt.getTime()) {
        throw new BadRequestException('Slot must end after it starts');
      }
      if (startsAt.getTime() <= now) {
        throw new BadRequestException('Slots must be in the future');
      }
      if (input.clubId) clubIds.add(input.clubId);
      const bufferBeforeMinutes = input.bufferBeforeMinutes ?? 0;
      const bufferAfterMinutes = input.bufferAfterMinutes ?? 0;
      const travelBufferMinutes = input.travelBufferMinutes ?? 0;
      return {
        startsAt,
        endsAt,
        clubId: input.clubId ?? undefined,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        travelBufferMinutes,
        blockedStartsAt: new Date(
          startsAt.getTime() -
            (bufferBeforeMinutes + travelBufferMinutes) * 60_000,
        ),
        blockedEndsAt: new Date(
          endsAt.getTime() +
            (bufferAfterMinutes + travelBufferMinutes) * 60_000,
        ),
      };
    });

    await this.assertClubAffiliation(coachUserId, [...clubIds]);
    for (let left = 0; left < parsed.length; left += 1) {
      for (let right = left + 1; right < parsed.length; right += 1) {
        if (
          parsed[left].blockedStartsAt < parsed[right].blockedEndsAt &&
          parsed[left].blockedEndsAt > parsed[right].blockedStartsAt
        ) {
          throw new ConflictException('Submitted coach slots overlap');
        }
      }
    }

    try {
      const created = await this.transactions.run(async (session) => {
        const coachOid = new Types.ObjectId(coachUserId);
        for (const clubId of [...clubIds].sort()) {
          await this.calendarGuard.lockClubCalendar(
            new Types.ObjectId(clubId),
            session,
          );
        }
        await this.calendarGuard.lockCoachCalendar(coachOid, session);
        for (const slot of parsed) {
          const clubOid = slot.clubId
            ? new Types.ObjectId(slot.clubId)
            : undefined;
          await this.calendarAvailability.assertAvailable(
            [
              { type: CalendarResourceType.COACH, id: coachOid },
              ...(clubOid
                ? [{ type: CalendarResourceType.CLUB, id: clubOid }]
                : []),
            ],
            slot.blockedStartsAt,
            slot.blockedEndsAt,
            session,
          );
          const overlap = await this.slotModel
            .findOne({
              coachUserId: coachOid,
              status: { $in: [CoachSlotStatus.OPEN, CoachSlotStatus.BOOKED] },
              $or: [
                {
                  blockedStartsAt: { $lt: slot.blockedEndsAt },
                  blockedEndsAt: { $gt: slot.blockedStartsAt },
                },
                {
                  blockedStartsAt: { $exists: false },
                  startsAt: { $lt: slot.blockedEndsAt },
                  endsAt: { $gt: slot.blockedStartsAt },
                },
              ],
            })
            .session(session);
          if (overlap) {
            throw new ConflictException('A coach slot overlaps this time');
          }
        }
        return this.slotModel.create(
          parsed.map((slot) => ({
            coachUserId: coachOid,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            bufferBeforeMinutes: slot.bufferBeforeMinutes,
            bufferAfterMinutes: slot.bufferAfterMinutes,
            travelBufferMinutes: slot.travelBufferMinutes,
            blockedStartsAt: slot.blockedStartsAt,
            blockedEndsAt: slot.blockedEndsAt,
            clubId: slot.clubId ? new Types.ObjectId(slot.clubId) : undefined,
            status: CoachSlotStatus.OPEN,
          })),
          { session },
        );
      });
      const clubById = await this.resolveClubs(created);
      return {
        slots: created.map((slot) => this.toPublicSlot(slot, clubById)),
      };
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('A slot already exists at that time');
      }
      throw error;
    }
  }

  async deleteMine(coachUserId: string, slotId: string) {
    if (!Types.ObjectId.isValid(slotId)) {
      throw new NotFoundException('Slot not found');
    }
    const deleted = await this.slotModel.findOneAndDelete({
      _id: new Types.ObjectId(slotId),
      coachUserId: new Types.ObjectId(coachUserId),
      status: CoachSlotStatus.OPEN,
    });
    if (!deleted) {
      throw new ConflictException('Slot not found or already booked');
    }
    return { deleted: true };
  }

  /** Clubs this coach can attach in-person slots to. */
  async listAffiliatedClubs(coachUserId: string): Promise<PublicClubRef[]> {
    const clubs = await this.clubModel
      .find({
        'coaches.coachId': new Types.ObjectId(coachUserId),
        'review.status': ClubLifecycleStatus.APPROVED,
        operationalStatus: ClubOperationalStatus.ACTIVE,
      })
      .select({ identity: 1, location: 1 });

    return clubs.map((club) => ({
      id: club._id.toString(),
      name: club.identity?.name ?? '',
      address: club.location?.address ?? null,
    }));
  }

  private async assertClubAffiliation(coachUserId: string, clubIds: string[]) {
    if (!clubIds.length) return;
    for (const clubId of clubIds) {
      if (!Types.ObjectId.isValid(clubId)) {
        throw new BadRequestException('Invalid clubId');
      }
    }
    const count = await this.clubModel.countDocuments({
      _id: { $in: clubIds.map((id) => new Types.ObjectId(id)) },
      'coaches.coachId': new Types.ObjectId(coachUserId),
      'review.status': ClubLifecycleStatus.APPROVED,
      operationalStatus: ClubOperationalStatus.ACTIVE,
    });
    if (count !== clubIds.length) {
      throw new BadRequestException(
        'clubId must reference an active club the coach is affiliated with',
      );
    }
  }

  private async resolveClubs(
    slots: CoachSlotDocument[],
  ): Promise<Map<string, PublicClubRef>> {
    const ids = [
      ...new Set(
        slots
          .map((slot) => slot.clubId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    if (!ids.length) return new Map();
    const clubs = await this.clubModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .select({ identity: 1, location: 1 });
    return new Map(
      clubs.map((club) => [
        club._id.toString(),
        {
          id: club._id.toString(),
          name: club.identity?.name ?? '',
          address: club.location?.address ?? null,
        },
      ]),
    );
  }

  private toPublicSlot(
    slot: CoachSlotDocument,
    clubById: Map<string, PublicClubRef>,
  ) {
    const clubId = slot.clubId?.toString();
    return {
      id: slot._id.toString(),
      coachUserId: slot.coachUserId.toString(),
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      bufferBeforeMinutes: slot.bufferBeforeMinutes ?? 0,
      bufferAfterMinutes: slot.bufferAfterMinutes ?? 0,
      travelBufferMinutes: slot.travelBufferMinutes ?? 0,
      status: slot.status,
      club: clubId ? (clubById.get(clubId) ?? null) : null,
    };
  }

  private parseRange(from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    // `to` given as a date-only string means "end of that day".
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      toDate.setUTCHours(23, 59, 59, 999);
    }
    const days = (toDate.getTime() - fromDate.getTime()) / 86_400_000;
    if (days < 0 || days > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `Range must be between 0 and ${MAX_RANGE_DAYS} days`,
      );
    }
    return { from: fromDate, to: toDate };
  }
}
