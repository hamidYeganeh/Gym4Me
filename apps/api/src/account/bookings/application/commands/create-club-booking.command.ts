import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'node:crypto';
import { Model, Types, type ClientSession } from 'mongoose';
import {
  BookingResourceType,
  BookingStatus,
  NotificationTemplateKey,
  SlotKind,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import {
  Booking,
  type BookingDocument,
} from '../../../../schemas/booking.schema';
import { Club, type ClubDocument } from '../../../../schemas/club.schema';
import { ClubSlotsService } from '../../../club-slots/club-slots.service';
import type { CreateClubBookingDto } from '../../dto/booking.dto';
import {
  assertMatchingBookingFingerprint,
  clubBookingFingerprint,
} from '../policies/booking-idempotency.policy';
import { BookingCalendarGuard } from '../services/booking-calendar-guard.service';

const ACTIVE_STATUSES = [
  BookingStatus.PENDING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
] as const;

const SLOT_KIND_TO_RESOURCE: Record<SlotKind, BookingResourceType> = {
  [SlotKind.CLASS]: BookingResourceType.CLASS,
  [SlotKind.SESSION]: BookingResourceType.SESSION,
  [SlotKind.SPACE]: BookingResourceType.SPACE,
};

const TEHRAN_OFFSET = '+03:30';

export type CreateClubBookingResult = {
  recurringGroupId?: Types.ObjectId;
  bookings: BookingDocument[];
};

/** Reserve one or more club occurrences as a single atomic use case. */
@Injectable()
export class CreateClubBookingCommand {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly clubSlots: ClubSlotsService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
    private readonly transactions: MongoTransactionService,
    private readonly calendarGuard: BookingCalendarGuard,
  ) {}

  async execute(
    athleteId: string,
    dto: CreateClubBookingDto,
    options?: {
      source?: 'athlete' | 'desk';
      holderType?: 'member' | 'guest';
      createdBy?: Types.ObjectId;
    },
  ): Promise<CreateClubBookingResult> {
    const dates = [...new Set(dto.dates)].sort();
    const fingerprint = clubBookingFingerprint(athleteId, dto);
    const idempotencyKeys = dto.idempotencyKey
      ? dates.map((date) => `${dto.idempotencyKey}:${date}`)
      : [];

    const replay = await this.findIdempotentBookings(
      athleteId,
      idempotencyKeys,
    );
    assertMatchingBookingFingerprint(replay, fingerprint);
    if (replay.length === dates.length && dates.length > 0) {
      return this.asResult(replay);
    }
    this.assertNoPartialReplay(replay);

    try {
      return await this.transactions.run(async (session) => {
        const club = await this.clubModel
          .findById(new Types.ObjectId(dto.clubId))
          .session(session);
        if (!club) throw new NotFoundException('Club not found');

        const transactionReplay = await this.findIdempotentBookings(
          athleteId,
          idempotencyKeys,
          session,
        );
        assertMatchingBookingFingerprint(transactionReplay, fingerprint);
        if (transactionReplay.length === dates.length && dates.length > 0) {
          return this.asResult(transactionReplay);
        }
        this.assertNoPartialReplay(transactionReplay);

        // Mongo sessions require sequential operations inside a transaction.
        const resolved: Awaited<
          ReturnType<ClubSlotsService['resolveBookableOccurrence']>
        >[] = [];
        for (const date of dates) {
          resolved.push(
            await this.clubSlots.resolveBookableOccurrence(
              dto.slotId,
              date,
              session,
            ),
          );
        }

        const first = resolved[0];
        if (!first) throw new BadRequestException('No booking dates supplied');
        const slot = first.slot;
        if (slot.clubId.toString() !== dto.clubId) {
          throw new NotFoundException('Slot not found');
        }

        const attendeeCount = dto.attendeeCount ?? 1;
        if (attendeeCount > slot.capacity) {
          throw new BadRequestException(
            'attendeeCount exceeds the occurrence capacity',
          );
        }

        for (const { occurrence, companionCoachId } of resolved) {
          if (
            occurrenceDate(occurrence.date, occurrence.startTime).getTime() <=
            Date.now()
          ) {
            throw new BadRequestException(
              `Occurrence ${occurrence.date} is in the past`,
            );
          }
          await this.calendarGuard.lockAndAssertClubResourceAvailable(
            {
              clubId: slot.clubId,
              slotId: slot._id,
              classId: slot.classId,
              spaceId: slot.spaceId,
            },
            occurrence.date,
            occurrenceDate(occurrence.date, occurrence.startTime),
            occurrenceDate(occurrence.date, occurrence.endTime),
            session,
          );
          if (companionCoachId) {
            await this.calendarGuard.lockAndAssertCoachAvailable(
              companionCoachId,
              occurrenceDate(occurrence.date, occurrence.startTime),
              occurrenceDate(occurrence.date, occurrence.endTime),
              session,
              {
                allowedSharedOccurrence: {
                  resourceRefId: slot._id,
                  occurrenceDate: occurrence.date,
                },
              },
            );
          }
        }

        const duplicate = await this.bookingModel
          .findOne({
            athleteId: new Types.ObjectId(athleteId),
            'resource.refId': slot._id,
            'occurrence.date': { $in: dates },
            status: { $in: [...ACTIVE_STATUSES] },
          })
          .session(session);
        if (duplicate) {
          throw new ConflictException(
            'You already have a booking for one of these occurrences',
          );
        }

        const resourceType = SLOT_KIND_TO_RESOURCE[slot.kind];
        const recurringGroupId =
          dates.length > 1 ? new Types.ObjectId() : undefined;
        const price = slot.price ?? 0;
        const bookings: BookingDocument[] = [];

        for (const { occurrence, companionCoachId } of resolved) {
          const occupied = await this.clubSlots.occupyOccurrence(
            slot._id,
            occurrence.date,
            attendeeCount,
            slot.capacity,
            session,
          );
          if (!occupied) {
            throw new ConflictException(
              `Occurrence ${occurrence.date} is fully booked`,
            );
          }

          const amount = price * attendeeCount;
          const [booking] = await this.bookingModel.create(
            [
              {
                code: `BK-${randomBytes(4).toString('hex').toUpperCase()}`,
                idempotencyKey: dto.idempotencyKey
                  ? `${dto.idempotencyKey}:${occurrence.date}`
                  : undefined,
                idempotencyFingerprint: dto.idempotencyKey
                  ? fingerprint
                  : undefined,
                athleteId: new Types.ObjectId(athleteId),
                source: options?.source ?? 'athlete',
                holderType: options?.holderType ?? 'member',
                createdBy: options?.createdBy,
                resource: { type: resourceType, refId: slot._id },
                clubId: slot.clubId,
                classId: slot.classId,
                spaceId: slot.spaceId,
                coachUserId: companionCoachId,
                occurrence,
                recurringGroupId,
                attendeeCount,
                startsAt: occurrenceDate(occurrence.date, occurrence.startTime),
                endsAt: occurrenceDate(occurrence.date, occurrence.endTime),
                intake: {
                  note: dto.intake?.note,
                  medicalConditionKeys: dto.intake?.medicalConditionKeys ?? [],
                  supplementKeys: dto.intake?.supplementKeys ?? [],
                },
                pricing: {
                  amount,
                  discount: 0,
                  couponCode: dto.couponCode,
                  total: amount,
                },
                status:
                  amount === 0
                    ? BookingStatus.CONFIRMED
                    : BookingStatus.AWAITING_PAYMENT,
                paymentExpiresAt:
                  amount === 0 ? undefined : this.paymentExpiresAt(),
              },
            ],
            { session },
          );
          if (!booking) throw new Error('Booking was not created');
          bookings.push(booking);

          if (amount === 0) {
            await this.enqueueConfirmation(booking, club, session);
          }
        }

        return { recurringGroupId, bookings };
      });
    } catch (error) {
      const winningReplay = await this.findIdempotentBookings(
        athleteId,
        idempotencyKeys,
      );
      assertMatchingBookingFingerprint(winningReplay, fingerprint);
      if (winningReplay.length === dates.length && dates.length > 0) {
        return this.asResult(winningReplay);
      }
      throw error;
    }
  }

  private async findIdempotentBookings(
    athleteId: string,
    idempotencyKeys: string[],
    session?: ClientSession,
  ): Promise<BookingDocument[]> {
    if (!idempotencyKeys.length) return [];
    const query = this.bookingModel
      .find({
        athleteId: new Types.ObjectId(athleteId),
        idempotencyKey: { $in: idempotencyKeys },
      })
      .select('+idempotencyFingerprint')
      .sort({ startsAt: 1 });
    return session ? query.session(session) : query;
  }

  private assertNoPartialReplay(bookings: BookingDocument[]): void {
    if (bookings.length > 0) {
      throw new ConflictException(
        'A partial booking retry exists; refresh bookings before retrying',
      );
    }
  }

  private asResult(bookings: BookingDocument[]): CreateClubBookingResult {
    return {
      recurringGroupId: bookings[0]?.recurringGroupId,
      bookings,
    };
  }

  private paymentExpiresAt(): Date {
    const minutes = Number(
      this.config.get<string>('BOOKING_PAYMENT_TTL_MINUTES') ?? 15,
    );
    return new Date(Date.now() + Math.max(1, minutes) * 60_000);
  }

  private async enqueueConfirmation(
    booking: BookingDocument,
    club: ClubDocument,
    session: ClientSession,
  ): Promise<void> {
    await this.outbox.enqueue(
      {
        eventName: 'booking.confirmed',
        payload: {
          bookingId: booking._id.toString(),
          code: booking.code,
          athleteId: booking.athleteId.toString(),
          clubId: booking.clubId?.toString() ?? null,
          notification: {
            userId: booking.athleteId.toString(),
            templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
            params: {
              clubName: club.identity.name,
              date: booking.occurrence?.date ?? '',
              time: booking.occurrence?.startTime ?? '',
            },
            payload: {
              bookingId: booking._id.toString(),
              code: booking.code,
            },
            critical: true,
          },
        },
        idempotencyKey: `outbox:booking.confirmed:${booking._id.toString()}`,
      },
      session,
    );
  }
}

function occurrenceDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${TEHRAN_OFFSET}`);
}
