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
  CalendarResourceType,
  CoachSlotStatus,
  ConsultationKind,
  VerificationStatus,
} from '../../../../common/enums';
import { MongoTransactionService } from '../../../../common/mongo/mongo-transaction.service';
import { OutboxService } from '../../../../outbox/outbox.service';
import { CouponsService } from '../../../../coupons/coupons.service';
import { CalendarAvailabilityService } from '../../../calendar/calendar-availability.service';
import {
  Booking,
  type BookingDocument,
} from '../../../../schemas/booking.schema';
import {
  CoachProfile,
  type CoachProfileDocument,
} from '../../../../schemas/coach-profile.schema';
import {
  CoachSlot,
  type CoachSlotDocument,
} from '../../../../schemas/coach-slot.schema';
import type { CreateBookingDto } from '../../dto/booking.dto';
import {
  assertMatchingBookingFingerprint,
  coachBookingFingerprint,
} from '../policies/booking-idempotency.policy';
import { BookingCalendarGuard } from '../services/booking-calendar-guard.service';

/** Atomically reserve a concrete coach slot and persist its booking snapshot. */
@Injectable()
export class CreateCoachBookingCommand {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(CoachSlot.name)
    private readonly slotModel: Model<CoachSlotDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    private readonly config: ConfigService,
    private readonly transactions: MongoTransactionService,
    private readonly calendarAvailability: CalendarAvailabilityService,
    private readonly calendarGuard: BookingCalendarGuard,
    private readonly outbox: OutboxService,
    private readonly coupons: CouponsService,
  ) {}

  async execute(
    athleteId: string,
    dto: CreateBookingDto,
  ): Promise<BookingDocument> {
    const fingerprint = coachBookingFingerprint(athleteId, dto);
    const existing = await this.findIdempotentBooking(
      athleteId,
      dto,
      fingerprint,
    );
    if (existing) return existing;

    const profile = await this.coachModel.findOne({
      userId: new Types.ObjectId(dto.coachUserId),
      'verification.status': VerificationStatus.APPROVED,
    });
    if (!profile) throw new NotFoundException('Coach not found');
    if (athleteId === dto.coachUserId) {
      throw new BadRequestException('You cannot book yourself');
    }

    const price =
      dto.consultationKind === ConsultationKind.IN_PERSON
        ? profile.pricing?.consultation?.inPerson
        : profile.pricing?.consultation?.remote;
    if (price === undefined || price === null) {
      throw new BadRequestException(
        'Coach does not offer this consultation type',
      );
    }

    try {
      return await this.transactions.run(async (session) => {
        const replay = await this.findIdempotentBooking(
          athleteId,
          dto,
          fingerprint,
          session,
        );
        if (replay) return replay;

        const currentProfile = await this.coachModel
          .findOne({
            userId: new Types.ObjectId(dto.coachUserId),
            'verification.status': VerificationStatus.APPROVED,
          })
          .session(session);
        if (!currentProfile) throw new NotFoundException('Coach not found');
        const currentPrice =
          dto.consultationKind === ConsultationKind.IN_PERSON
            ? currentProfile.pricing?.consultation?.inPerson
            : currentProfile.pricing?.consultation?.remote;
        if (currentPrice === undefined || currentPrice === null) {
          throw new BadRequestException(
            'Coach does not offer this consultation type',
          );
        }

        const slot = await this.slotModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(dto.slotId),
            coachUserId: new Types.ObjectId(dto.coachUserId),
            status: CoachSlotStatus.OPEN,
            startsAt: { $gt: new Date() },
          },
          { $set: { status: CoachSlotStatus.BOOKED } },
          { new: true, session },
        );
        if (!slot) {
          throw new ConflictException('Slot is no longer available');
        }
        const redeemed = dto.couponCode
          ? await this.coupons.redeem(
              dto.couponCode,
              {
                userId: athleteId,
                clubId: slot.clubId?.toString(),
                amount: currentPrice,
                contextKey: `booking:${athleteId}:${dto.idempotencyKey}`,
              },
              session,
            )
          : { discount: 0 };
        const isInPersonSlot = Boolean(slot.clubId);
        if (
          isInPersonSlot !==
          (dto.consultationKind === ConsultationKind.IN_PERSON)
        ) {
          throw new BadRequestException(
            'Consultation type does not match the selected slot venue',
          );
        }
        const calendarStartsAt = slot.blockedStartsAt ?? slot.startsAt;
        const calendarEndsAt = slot.blockedEndsAt ?? slot.endsAt;

        await this.calendarAvailability.assertAvailable(
          [
            {
              type: CalendarResourceType.COACH,
              id: new Types.ObjectId(dto.coachUserId),
            },
            ...(dto.consultationKind === ConsultationKind.IN_PERSON &&
            slot.clubId
              ? [{ type: CalendarResourceType.CLUB, id: slot.clubId }]
              : []),
          ],
          calendarStartsAt,
          calendarEndsAt,
          session,
        );
        if (
          dto.consultationKind === ConsultationKind.IN_PERSON &&
          slot.clubId
        ) {
          await this.calendarGuard.lockClubCalendar(slot.clubId, session);
        }
        await this.calendarGuard.lockAndAssertCoachAvailable(
          new Types.ObjectId(dto.coachUserId),
          calendarStartsAt,
          calendarEndsAt,
          session,
        );

        const [created] = await this.bookingModel.create(
          [
            {
              code: `BK-${randomBytes(4).toString('hex').toUpperCase()}`,
              idempotencyKey: dto.idempotencyKey,
              idempotencyFingerprint: dto.idempotencyKey
                ? fingerprint
                : undefined,
              athleteId: new Types.ObjectId(athleteId),
              resource: {
                type: BookingResourceType.COACH,
                refId: slot._id,
              },
              coachUserId: new Types.ObjectId(dto.coachUserId),
              slotId: slot._id,
              clubId:
                dto.consultationKind === ConsultationKind.IN_PERSON
                  ? slot.clubId
                  : undefined,
              consultationKind: dto.consultationKind,
              startsAt: slot.startsAt,
              endsAt: slot.endsAt,
              calendarStartsAt,
              calendarEndsAt,
              intake: {
                note: dto.intake?.note,
                medicalConditionKeys: dto.intake?.medicalConditionKeys ?? [],
                supplementKeys: dto.intake?.supplementKeys ?? [],
              },
              pricing: {
                amount: currentPrice,
                discount: redeemed.discount,
                couponCode: dto.couponCode,
                total: Math.max(0, currentPrice - redeemed.discount),
              },
              status: BookingStatus.PENDING,
              approvalExpiresAt: this.approvalExpiresAt(),
            },
          ],
          { session },
        );
        if (!created) throw new Error('Booking was not created');
        await this.outbox.enqueue(
          {
            eventName: 'booking.coach_approval_requested',
            payload: {
              bookingId: created._id.toString(),
              code: created.code,
              athleteId,
              coachUserId: dto.coachUserId,
              approvalExpiresAt: created.approvalExpiresAt?.toISOString(),
            },
            idempotencyKey: `outbox:booking.coach_approval_requested:${created._id.toString()}`,
          },
          session,
        );
        return created;
      });
    } catch (error) {
      const replay = await this.findIdempotentBooking(
        athleteId,
        dto,
        fingerprint,
      );
      if (replay) return replay;
      throw error;
    }
  }

  private approvalExpiresAt(): Date {
    const minutes = Number(
      this.config.get<string>('BOOKING_COACH_APPROVAL_TTL_MINUTES') ?? 1_440,
    );
    return new Date(Date.now() + Math.max(5, minutes) * 60_000);
  }

  private async findIdempotentBooking(
    athleteId: string,
    dto: CreateBookingDto,
    fingerprint: string,
    session?: ClientSession,
  ): Promise<BookingDocument | null> {
    if (!dto.idempotencyKey) return null;
    const query = this.bookingModel
      .findOne({
        athleteId: new Types.ObjectId(athleteId),
        idempotencyKey: dto.idempotencyKey,
      })
      .select('+idempotencyFingerprint');
    const booking = session ? await query.session(session) : await query;
    if (booking) assertMatchingBookingFingerprint([booking], fingerprint);
    return booking;
  }
}
