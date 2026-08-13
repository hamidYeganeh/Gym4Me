import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import { randomBytes } from 'node:crypto';
import {
  BookingActor,
  BookingResourceType,
  BookingStatus,
  CoachSlotStatus,
  ConsultationKind,
  NotificationTemplateKey,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
  SlotKind,
  VerificationStatus,
} from '../../common/enums';
import { PaymentGatewayService } from '../../common/payment';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import { FinanceService } from '../../finance/finance.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { OutboxService } from '../../outbox/outbox.service';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { ClubClass, ClubClassDocument } from '../../schemas/club-class.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { ClubSpace, ClubSpaceDocument } from '../../schemas/club-space.schema';
import {
  CoachProfile,
  CoachProfileDocument,
} from '../../schemas/coach-profile.schema';
import { CoachSlot, CoachSlotDocument } from '../../schemas/coach-slot.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { ClubSlotsService } from '../club-slots/club-slots.service';
import {
  AdminListBookingsQueryDto,
  CancelBookingDto,
  CancelBookingSeriesDto,
  CreateBookingDto,
  CreateClubBookingDto,
  ListBookingsQueryDto,
  RescheduleBookingDto,
  VerifyBookingPaymentDto,
} from './dto/booking.dto';

/** Statuses that keep a slot / occurrence seat occupied. */
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

type Audience = 'athlete' | 'coach' | 'club' | 'admin';

/** Fixed Tehran offset — club occurrence times are local wall-clock. */
const TEHRAN_OFFSET = '+03:30';

function occurrenceDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${TEHRAN_OFFSET}`);
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(CoachSlot.name)
    private readonly slotModel: Model<CoachSlotDocument>,
    @InjectModel(CoachProfile.name)
    private readonly coachModel: Model<CoachProfileDocument>,
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubClass.name)
    private readonly classModel: Model<ClubClassDocument>,
    @InjectModel(ClubSpace.name)
    private readonly spaceModel: Model<ClubSpaceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly clubSlots: ClubSlotsService,
    private readonly gateway: PaymentGatewayService,
    private readonly finance: FinanceService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
  ) {}

  private paymentTtlMs() {
    const minutes = Number(
      this.config.get<string>('BOOKING_PAYMENT_TTL_MINUTES') ?? 15,
    );
    return Math.max(1, minutes) * 60_000;
  }

  private paymentExpiresAt() {
    return new Date(Date.now() + this.paymentTtlMs());
  }

  private approvalExpiresAt() {
    const minutes = Number(
      this.config.get<string>('BOOKING_COACH_APPROVAL_TTL_MINUTES') ?? 1_440,
    );
    return new Date(Date.now() + Math.max(5, minutes) * 60_000);
  }

  /**
   * Cancel AWAITING_PAYMENT bookings past paymentExpiresAt and release seats.
   * Idempotent — safe to call from the poller or tests.
   */
  async expireUnpaidBookings(limit = 100) {
    const now = new Date();
    const expired = await this.bookingModel
      .find({
        $or: [
          {
            status: BookingStatus.AWAITING_PAYMENT,
            paymentExpiresAt: { $lte: now },
          },
          {
            status: BookingStatus.PENDING,
            approvalExpiresAt: { $lte: now },
          },
        ],
      })
      .limit(limit);

    let cancelled = 0;
    for (const booking of expired) {
      try {
        const approvalExpired = booking.status === BookingStatus.PENDING;
        await this.cancel(
          booking,
          {
            reasonKey: approvalExpired
              ? 'coach_approval_ttl_expired'
              : 'payment_ttl_expired',
            note: approvalExpired ? 'Coach approval TTL' : 'Unpaid booking TTL',
          },
          BookingActor.SYSTEM,
          'admin',
        );
        cancelled += 1;
      } catch (err) {
        this.logger.warn(
          `Failed to expire booking ${booking._id.toString()}: ${String(err)}`,
        );
      }
    }
    return { scanned: expired.length, cancelled };
  }

  // ── Athlete: coach bookings ────────────────────────────────────────────

  async create(athleteId: string, dto: CreateBookingDto) {
    if (dto.idempotencyKey) {
      const existing = await this.bookingModel.findOne({
        athleteId: new Types.ObjectId(athleteId),
        idempotencyKey: dto.idempotencyKey,
      });
      if (existing) return this.project(existing, 'athlete');
    }
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

    // Atomically occupy the slot: open → booked.
    const slot = await this.slotModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dto.slotId),
        coachUserId: new Types.ObjectId(dto.coachUserId),
        status: CoachSlotStatus.OPEN,
        startsAt: { $gt: new Date() },
      },
      { $set: { status: CoachSlotStatus.BOOKED } },
      { new: true },
    );
    if (!slot) {
      throw new ConflictException('Slot is no longer available');
    }

    try {
      // Coupons are stored for later validation infra; no discount engine yet.
      const discount = 0;
      const booking = await this.bookingModel.create({
        code: this.generateCode(),
        idempotencyKey: dto.idempotencyKey,
        athleteId: new Types.ObjectId(athleteId),
        resource: { type: BookingResourceType.COACH, refId: slot._id },
        coachUserId: new Types.ObjectId(dto.coachUserId),
        slotId: slot._id,
        clubId:
          dto.consultationKind === ConsultationKind.IN_PERSON
            ? slot.clubId
            : undefined,
        consultationKind: dto.consultationKind,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        intake: {
          note: dto.intake?.note,
          medicalConditionKeys: dto.intake?.medicalConditionKeys ?? [],
          supplementKeys: dto.intake?.supplementKeys ?? [],
        },
        pricing: {
          amount: price,
          discount,
          couponCode: dto.couponCode,
          total: Math.max(0, price - discount),
        },
        status: BookingStatus.PENDING,
        approvalExpiresAt: this.approvalExpiresAt(),
      });
      return this.project(booking, 'athlete');
    } catch (error) {
      await this.releaseCoachSlot(slot._id);
      throw error;
    }
  }

  // ── Athlete: club bookings (session / class / space) ──────────────────

  async createClubBooking(athleteId: string, dto: CreateClubBookingDto) {
    const club = await this.clubModel.findById(new Types.ObjectId(dto.clubId));
    if (!club) throw new NotFoundException('Club not found');

    const dates = [...new Set(dto.dates)].sort();

    if (dto.idempotencyKey) {
      const keys = dates.map((date) => `${dto.idempotencyKey}:${date}`);
      const existing = await this.bookingModel
        .find({
          athleteId: new Types.ObjectId(athleteId),
          idempotencyKey: { $in: keys },
        })
        .sort({ startsAt: 1 });
      if (existing.length === dates.length) {
        return {
          recurringGroupId: existing[0]?.recurringGroupId?.toString() ?? null,
          bookings: await this.projectMany(existing, 'athlete'),
        };
      }
      if (existing.length > 0) {
        throw new ConflictException(
          'A partial booking retry exists; refresh bookings before retrying',
        );
      }
    }
    const attendeeCount = dto.attendeeCount ?? 1;

    // Resolve every occurrence up-front so we fail before occupying seats.
    const resolved = await Promise.all(
      dates.map((date) =>
        this.clubSlots.resolveBookableOccurrence(dto.slotId, date),
      ),
    );
    const slot = resolved[0].slot;
    if (slot.clubId.toString() !== dto.clubId) {
      throw new NotFoundException('Slot not found');
    }
    if (attendeeCount > slot.capacity) {
      throw new BadRequestException(
        'attendeeCount exceeds the occurrence capacity',
      );
    }

    const now = Date.now();
    for (const { occurrence } of resolved) {
      const startsAt = occurrenceDate(occurrence.date, occurrence.startTime);
      if (startsAt.getTime() <= now) {
        throw new BadRequestException(
          `Occurrence ${occurrence.date} is in the past`,
        );
      }
    }

    // One active booking per athlete per occurrence (conflict lock, D12).
    const duplicate = await this.bookingModel.findOne({
      athleteId: new Types.ObjectId(athleteId),
      'resource.refId': slot._id,
      'occurrence.date': { $in: dates },
      status: { $in: [...ACTIVE_STATUSES] },
    });
    if (duplicate) {
      throw new ConflictException(
        'You already have a booking for one of these occurrences',
      );
    }

    const resourceType = SLOT_KIND_TO_RESOURCE[slot.kind];
    const recurringGroupId =
      dates.length > 1 ? new Types.ObjectId() : undefined;
    const price = slot.price ?? 0;
    const occupied: string[] = [];
    const created: BookingDocument[] = [];

    try {
      for (const { occurrence } of resolved) {
        const ok = await this.clubSlots.occupyOccurrence(
          slot._id,
          occurrence.date,
          attendeeCount,
          slot.capacity,
        );
        if (!ok) {
          throw new ConflictException(
            `Occurrence ${occurrence.date} is fully booked`,
          );
        }
        occupied.push(occurrence.date);

        const amount = price * attendeeCount;
        const booking = await this.bookingModel.create({
          code: this.generateCode(),
          idempotencyKey: dto.idempotencyKey
            ? `${dto.idempotencyKey}:${occurrence.date}`
            : undefined,
          athleteId: new Types.ObjectId(athleteId),
          resource: { type: resourceType, refId: slot._id },
          clubId: slot.clubId,
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
          paymentExpiresAt: amount === 0 ? undefined : this.paymentExpiresAt(),
        });
        created.push(booking);
      }
    } catch (error) {
      // Roll back everything: created bookings + occupied seats.
      if (created.length) {
        await this.bookingModel.deleteMany({
          _id: { $in: created.map((b) => b._id) },
        });
      }
      for (const date of occupied) {
        await this.clubSlots.releaseOccurrence(slot._id, date, attendeeCount);
      }
      throw error;
    }

    for (const booking of created) {
      if (booking.status === BookingStatus.CONFIRMED) {
        await this.notifyConfirmed(booking);
      }
    }

    const bookings = await this.projectMany(created, 'athlete');
    return {
      recurringGroupId: recurringGroupId?.toString() ?? null,
      bookings,
    };
  }

  async listForAthlete(athleteId: string, query: ListBookingsQueryDto) {
    return this.list(
      { athleteId: new Types.ObjectId(athleteId) },
      query,
      'athlete',
    );
  }

  async getForAthlete(athleteId: string, id: string) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    return this.project(booking, 'athlete');
  }

  async pay(athleteId: string, id: string, callbackUrl: string) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
      throw new ConflictException('Booking is not awaiting payment');
    }

    const payment = await this.gateway.createPayment({
      // Gateway operates in Rials; pricing is stored in Tomans.
      amount: booking.pricing.total * 10,
      description: `Booking ${booking.code}`,
      callbackUrl,
      orderId: booking.code,
    });

    booking.payment = {
      provider: process.env.PAYMENT_PROVIDER ?? 'mock',
      authority: payment.authority,
    };
    booking.markModified('payment');
    await booking.save();

    return {
      bookingId: booking._id.toString(),
      authority: payment.authority,
      redirectUrl: payment.redirectUrl,
    };
  }

  async verifyPayment(
    athleteId: string,
    id: string,
    dto: VerifyBookingPaymentDto,
  ) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    if (booking.status === BookingStatus.CONFIRMED) {
      return this.project(booking, 'athlete');
    }
    if (booking.status !== BookingStatus.AWAITING_PAYMENT) {
      throw new ConflictException('Booking is not awaiting payment');
    }
    if (booking.payment?.authority !== dto.authority) {
      throw new BadRequestException('Unknown payment authority');
    }
    if (dto.status !== 'OK') {
      return this.project(booking, 'athlete');
    }

    const verification = await this.gateway.verifyPayment({
      authority: dto.authority,
      amount: booking.pricing.total * 10,
    });
    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.message}`,
      );
    }

    booking.payment = {
      ...booking.payment,
      refId: verification.refId,
      paidAt: new Date(),
    };
    booking.status = BookingStatus.CONFIRMED;
    booking.markModified('payment');
    await booking.save();

    await this.finance.recordPayment(
      {
        purpose: PaymentPurpose.BOOKING,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.CAPTURED,
        amount: {
          gross: booking.pricing.amount,
          discount: booking.pricing.discount,
          net: booking.pricing.total,
        },
        reference: {
          orderId: booking.code,
          authority: dto.authority,
          gatewayRefId: verification.refId,
        },
        payer: { userId: athleteId },
        related: {
          bookingId: booking._id.toString(),
          clubId: booking.clubId?.toString(),
          coachUserId: booking.coachUserId?.toString(),
        },
        idempotencyKey: `booking:${booking._id.toString()}:pay:${dto.authority}`,
      },
      { actorId: athleteId },
    );

    await this.notifyConfirmed(booking);
    return this.project(booking, 'athlete');
  }

  async reschedule(athleteId: string, id: string, dto: RescheduleBookingDto) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    if (
      booking.status !== BookingStatus.AWAITING_PAYMENT &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new ConflictException('Booking can no longer be rescheduled');
    }

    if (booking.resource.type === BookingResourceType.COACH) {
      return this.rescheduleCoachBooking(booking, dto);
    }
    return this.rescheduleClubBooking(booking, dto);
  }

  private async rescheduleCoachBooking(
    booking: BookingDocument,
    dto: RescheduleBookingDto,
  ) {
    if (!dto.slotId) {
      throw new BadRequestException('slotId is required');
    }
    if (booking.slotId?.toString() === dto.slotId) {
      throw new BadRequestException('Booking already uses this slot');
    }

    const newSlot = await this.slotModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dto.slotId),
        coachUserId: booking.coachUserId,
        status: CoachSlotStatus.OPEN,
        startsAt: { $gt: new Date() },
      },
      { $set: { status: CoachSlotStatus.BOOKED } },
      { new: true },
    );
    if (!newSlot) {
      throw new ConflictException('Selected slot is no longer available');
    }

    const previousSlotId = booking.slotId!;
    booking.rescheduledFromSlotId = previousSlotId;
    booking.slotId = newSlot._id;
    booking.resource = {
      type: BookingResourceType.COACH,
      refId: newSlot._id,
    };
    booking.startsAt = newSlot.startsAt;
    booking.endsAt = newSlot.endsAt;
    if (booking.consultationKind === ConsultationKind.IN_PERSON) {
      booking.clubId = newSlot.clubId;
    }
    booking.markModified('resource');
    await booking.save();
    await this.releaseCoachSlot(previousSlotId);
    return this.project(booking, 'athlete');
  }

  private async rescheduleClubBooking(
    booking: BookingDocument,
    dto: RescheduleBookingDto,
  ) {
    if (!dto.date) {
      throw new BadRequestException('date is required');
    }
    const targetSlotId = dto.slotId ?? booking.resource.refId.toString();
    if (
      targetSlotId === booking.resource.refId.toString() &&
      dto.date === booking.occurrence?.date
    ) {
      throw new BadRequestException('Booking already uses this occurrence');
    }

    const { slot, occurrence } = await this.clubSlots.resolveBookableOccurrence(
      targetSlotId,
      dto.date,
    );
    if (slot.clubId.toString() !== booking.clubId?.toString()) {
      throw new BadRequestException('Slot belongs to a different club');
    }
    if (SLOT_KIND_TO_RESOURCE[slot.kind] !== booking.resource.type) {
      throw new BadRequestException('Slot kind does not match the booking');
    }
    const startsAt = occurrenceDate(occurrence.date, occurrence.startTime);
    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('Occurrence is in the past');
    }
    if (booking.attendeeCount > slot.capacity) {
      throw new BadRequestException(
        'attendeeCount exceeds the occurrence capacity',
      );
    }

    const ok = await this.clubSlots.occupyOccurrence(
      slot._id,
      occurrence.date,
      booking.attendeeCount,
      slot.capacity,
    );
    if (!ok) {
      throw new ConflictException('Selected occurrence is fully booked');
    }

    const previousRefId = booking.resource.refId;
    const previousDate = booking.occurrence!.date;

    booking.resource = {
      type: SLOT_KIND_TO_RESOURCE[slot.kind],
      refId: slot._id,
    };
    booking.occurrence = occurrence;
    booking.startsAt = startsAt;
    booking.endsAt = occurrenceDate(occurrence.date, occurrence.endTime);
    booking.markModified('resource');
    booking.markModified('occurrence');
    await booking.save();
    await this.clubSlots.releaseOccurrence(
      previousRefId,
      previousDate,
      booking.attendeeCount,
    );
    return this.project(booking, 'athlete');
  }

  async cancelByAthlete(athleteId: string, id: string, dto: CancelBookingDto) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    return this.cancel(booking, dto, BookingActor.ATHLETE, 'athlete');
  }

  async cancellationPreviewForAthlete(athleteId: string, id: string) {
    const booking = await this.findOwned(id, {
      athleteId: new Types.ObjectId(athleteId),
    });
    const feePercent = booking.payment?.paidAt
      ? await this.cancellationFeePercent(booking)
      : 0;
    return this.cancellationPreview(booking, feePercent);
  }

  /** Cancel remaining occurrences of a recurring series from a date. */
  async cancelSeriesByAthlete(
    athleteId: string,
    groupId: string,
    dto: CancelBookingSeriesDto,
  ) {
    if (!Types.ObjectId.isValid(groupId)) {
      throw new NotFoundException('Series not found');
    }
    const fromDate = dto.fromDate
      ? occurrenceDate(dto.fromDate, '00:00')
      : new Date();
    const bookings = await this.bookingModel.find({
      athleteId: new Types.ObjectId(athleteId),
      recurringGroupId: new Types.ObjectId(groupId),
      status: { $in: [...ACTIVE_STATUSES] },
      startsAt: { $gte: fromDate },
    });
    if (!bookings.length) {
      throw new NotFoundException('No cancellable bookings in this series');
    }
    const results: Awaited<ReturnType<BookingsService['cancel']>>[] = [];
    for (const booking of bookings) {
      results.push(
        await this.cancel(booking, dto, BookingActor.ATHLETE, 'athlete'),
      );
    }
    return { cancelled: results.length, bookings: results };
  }

  // ── Coach ──────────────────────────────────────────────────────────────

  async listForCoach(coachUserId: string, query: ListBookingsQueryDto) {
    return this.list(
      { coachUserId: new Types.ObjectId(coachUserId) },
      query,
      'coach',
    );
  }

  async getForCoach(coachUserId: string, id: string) {
    const booking = await this.findOwned(id, {
      coachUserId: new Types.ObjectId(coachUserId),
    });
    return this.project(booking, 'coach');
  }

  async acceptByCoach(coachUserId: string, id: string) {
    const booking = await this.findOwned(id, {
      coachUserId: new Types.ObjectId(coachUserId),
    });
    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException('Booking is not awaiting coach approval');
    }

    booking.approvalExpiresAt = undefined;
    if (booking.pricing.total > 0) {
      booking.status = BookingStatus.AWAITING_PAYMENT;
      booking.paymentExpiresAt = this.paymentExpiresAt();
    } else {
      booking.status = BookingStatus.CONFIRMED;
      booking.paymentExpiresAt = undefined;
    }
    await booking.save();
    if (booking.status === BookingStatus.CONFIRMED) {
      await this.notifyConfirmed(booking);
    } else if (booking.paymentExpiresAt) {
      await this.notifications.dispatch({
        userId: booking.athleteId,
        templateKey: NotificationTemplateKey.BOOKING_APPROVED_PAYMENT_REQUIRED,
        params: { deadline: booking.paymentExpiresAt.toISOString() },
        payload: {
          bookingId: booking._id.toString(),
          action: 'pay_booking',
        },
        critical: true,
        idempotencyKey: `booking.approved:${booking._id.toString()}`,
      });
    }
    return this.project(booking, 'coach');
  }

  async cancellationPreviewForCoach(coachUserId: string, id: string) {
    const booking = await this.findOwned(id, {
      coachUserId: new Types.ObjectId(coachUserId),
    });
    return this.cancellationPreview(booking, 0);
  }

  async cancelByCoach(coachUserId: string, id: string, dto: CancelBookingDto) {
    const booking = await this.findOwned(id, {
      coachUserId: new Types.ObjectId(coachUserId),
    });
    return this.cancel(booking, dto, BookingActor.COACH, 'coach');
  }

  async checkIn(coachUserId: string, id: string) {
    return this.transition(
      { coachUserId: new Types.ObjectId(coachUserId) },
      id,
      [BookingStatus.CONFIRMED],
      BookingStatus.CHECKED_IN,
      'coach',
    );
  }

  async complete(coachUserId: string, id: string) {
    return this.transition(
      { coachUserId: new Types.ObjectId(coachUserId) },
      id,
      [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
      BookingStatus.COMPLETED,
      'coach',
    );
  }

  async markNoShow(coachUserId: string, id: string) {
    return this.transition(
      { coachUserId: new Types.ObjectId(coachUserId) },
      id,
      [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
      BookingStatus.NO_SHOW,
      'coach',
    );
  }

  // ── Club owner ─────────────────────────────────────────────────────────

  async requireOwnedClub(ownerId: string, clubId: string) {
    if (!Types.ObjectId.isValid(clubId)) {
      throw new NotFoundException('Club not found');
    }
    const club = await this.clubModel.findById(new Types.ObjectId(clubId));
    if (!club) throw new NotFoundException('Club not found');
    if (club.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Not your club');
    }
    return club;
  }

  async listForClub(clubId: string, query: ListBookingsQueryDto) {
    return this.list({ clubId: new Types.ObjectId(clubId) }, query, 'club');
  }

  async getForClub(clubId: string, id: string) {
    const booking = await this.findOwned(id, {
      clubId: new Types.ObjectId(clubId),
    });
    return this.project(booking, 'club');
  }

  async checkInByClub(clubId: string, id: string) {
    return this.transition(
      { clubId: new Types.ObjectId(clubId) },
      id,
      [BookingStatus.CONFIRMED],
      BookingStatus.CHECKED_IN,
      'club',
    );
  }

  async completeByClub(clubId: string, id: string) {
    return this.transition(
      { clubId: new Types.ObjectId(clubId) },
      id,
      [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
      BookingStatus.COMPLETED,
      'club',
    );
  }

  async markNoShowByClub(clubId: string, id: string) {
    return this.transition(
      { clubId: new Types.ObjectId(clubId) },
      id,
      [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
      BookingStatus.NO_SHOW,
      'club',
    );
  }

  async cancelByClub(clubId: string, id: string, dto: CancelBookingDto) {
    const booking = await this.findOwned(id, {
      clubId: new Types.ObjectId(clubId),
    });
    return this.cancel(booking, dto, BookingActor.CLUB, 'club');
  }

  // ── Admin ──────────────────────────────────────────────────────────────

  async listForAdmin(query: AdminListBookingsQueryDto) {
    const filter: QueryFilter<BookingDocument> = {};
    if (query.athleteId) filter.athleteId = new Types.ObjectId(query.athleteId);
    if (query.coachUserId) {
      filter.coachUserId = new Types.ObjectId(query.coachUserId);
    }
    if (query.clubId) filter.clubId = new Types.ObjectId(query.clubId);
    return this.list(filter, query, 'admin');
  }

  async getForAdmin(id: string) {
    const booking = await this.findOwned(id, {});
    return this.project(booking, 'admin');
  }

  async cancelByAdmin(id: string, dto: CancelBookingDto) {
    const booking = await this.findOwned(id, {});
    return this.cancel(booking, dto, BookingActor.ADMIN, 'admin');
  }

  /** Settle a refund request (or refund a paid provider-cancelled booking). */
  async refundByAdmin(id: string) {
    const booking = await this.findOwned(id, {});
    const refundable: BookingStatus[] = [
      BookingStatus.REFUND_REQUESTED,
      BookingStatus.CANCELLED,
      BookingStatus.REJECTED,
    ];
    if (!refundable.includes(booking.status) || !booking.payment?.paidAt) {
      throw new ConflictException('Booking has no refundable payment');
    }
    booking.status = BookingStatus.REFUNDED;
    await booking.save();
    return this.project(booking, 'admin');
  }

  // ── Shared internals ───────────────────────────────────────────────────

  private async transition(
    ownerFilter: QueryFilter<BookingDocument>,
    id: string,
    fromStatuses: BookingStatus[],
    toStatus: BookingStatus,
    audience: Audience,
  ) {
    const booking = await this.findOwned(id, ownerFilter);
    if (!fromStatuses.includes(booking.status)) {
      throw new ConflictException(
        `Booking must be ${fromStatuses.join(' or ')} to become ${toStatus}`,
      );
    }
    booking.status = toStatus;
    await booking.save();
    return this.project(booking, audience);
  }

  private async cancel(
    booking: BookingDocument,
    dto: CancelBookingDto,
    actor: BookingActor,
    audience: Audience,
  ) {
    const cancellable: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.AWAITING_PAYMENT,
      BookingStatus.CONFIRMED,
    ];
    if (!cancellable.includes(booking.status)) {
      throw new ConflictException('Booking can no longer be cancelled');
    }

    const wasPaid = Boolean(booking.payment?.paidAt);
    const providerCancel =
      actor === BookingActor.COACH || actor === BookingActor.CLUB;
    const systemExpire =
      actor === BookingActor.SYSTEM ||
      (actor === BookingActor.ADMIN && dto.reasonKey === 'payment_ttl_expired');

    let nextStatus: BookingStatus;
    if (systemExpire || booking.status === BookingStatus.AWAITING_PAYMENT) {
      nextStatus = BookingStatus.CANCELLED;
    } else if (providerCancel && wasPaid) {
      // A provider cancellation always returns captured funds; athlete
      // cancellation-window fees never apply to a provider-initiated cancel.
      nextStatus = BookingStatus.REFUND_REQUESTED;
    } else if (wasPaid) {
      const refundEligible = await this.isRefundEligible(booking);
      nextStatus = refundEligible
        ? BookingStatus.REFUND_REQUESTED
        : BookingStatus.CANCELLED;
    } else if (providerCancel) {
      nextStatus = BookingStatus.REJECTED;
    } else {
      nextStatus = BookingStatus.CANCELLED;
    }

    booking.status = nextStatus;
    booking.paymentExpiresAt = undefined;
    booking.approvalExpiresAt = undefined;
    booking.cancellation = {
      reasonKey: dto.reasonKey,
      note: dto.note,
      cancelledAt: new Date(),
      cancelledBy: actor === BookingActor.SYSTEM ? BookingActor.ADMIN : actor,
    };
    booking.markModified('cancellation');
    await booking.save();
    await this.releaseResource(booking);
    if (
      providerCancel ||
      actor === BookingActor.ADMIN ||
      actor === BookingActor.SYSTEM
    ) {
      await this.notifyProviderCancelled(booking);
    }
    return this.project(booking, audience);
  }

  /** Apply club.cancellation rules: refund if hours remaining >= matching rule with feePercent < 100. */
  private async isRefundEligible(booking: BookingDocument): Promise<boolean> {
    return (await this.cancellationFeePercent(booking)) < 100;
  }

  private async cancellationFeePercent(
    booking: BookingDocument,
  ): Promise<number> {
    if (!booking.clubId) return 0;
    const club = await this.clubModel.findById(booking.clubId).lean();
    const rules = club?.cancellation?.rules ?? [];
    if (!rules.length) return 0;

    const hoursBefore =
      (booking.startsAt.getTime() - Date.now()) / (1000 * 60 * 60);
    const sorted = [...rules].sort(
      (a, b) => b.hoursBeforeReservation - a.hoursBeforeReservation,
    );
    const matched =
      sorted.find((r) => hoursBefore >= r.hoursBeforeReservation) ??
      sorted[sorted.length - 1];
    return Math.min(100, Math.max(0, matched?.feePercent ?? 0));
  }

  private cancellationPreview(booking: BookingDocument, feePercent: number) {
    const paid = Boolean(booking.payment?.paidAt);
    const total = booking.pricing.total;
    const feeAmount = paid ? Math.round((total * feePercent) / 100) : 0;
    return {
      bookingId: booking._id.toString(),
      paid,
      total,
      feePercent,
      feeAmount,
      refundAmount: paid ? Math.max(0, total - feeAmount) : 0,
      currency: 'IRT',
    };
  }

  private async releaseResource(booking: BookingDocument) {
    if (booking.resource.type === BookingResourceType.COACH) {
      if (booking.slotId) await this.releaseCoachSlot(booking.slotId);
      return;
    }
    if (booking.occurrence) {
      await this.clubSlots.releaseOccurrence(
        booking.resource.refId,
        booking.occurrence.date,
        booking.attendeeCount,
      );
    }
  }

  private async list(
    ownerFilter: QueryFilter<BookingDocument>,
    query: ListBookingsQueryDto,
    audience: Audience,
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<BookingDocument> = { ...ownerFilter };

    if (query.resource_type) filter['resource.type'] = query.resource_type;

    if (query.status) filter.status = query.status;
    else if (query.bucket === 'upcoming') {
      filter.status = { $in: [...ACTIVE_STATUSES] };
      filter.startsAt = { $gte: new Date() };
    } else if (query.bucket === 'past') {
      filter.$or = [
        {
          status: {
            $in: [BookingStatus.COMPLETED, BookingStatus.NO_SHOW],
          },
        },
        {
          status: { $in: [...ACTIVE_STATUSES] },
          startsAt: { $lt: new Date() },
        },
      ];
    } else if (query.bucket === 'cancelled') {
      filter.status = {
        $in: [
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
          BookingStatus.REFUND_REQUESTED,
          BookingStatus.REFUNDED,
        ],
      };
    }

    if (query.from || query.to) {
      const startsAt: Record<string, Date> = {};
      if (query.from) startsAt.$gte = new Date(query.from);
      if (query.to) startsAt.$lte = new Date(query.to);
      filter.startsAt = startsAt;
    }

    const total = await this.bookingModel.countDocuments(filter);
    const bookings = await this.bookingModel
      .find(filter)
      .sort({ startsAt: query.bucket === 'past' ? -1 : 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const projected = await this.projectMany(bookings, audience);
    return paginatedResult(projected, total, page, pageSize);
  }

  private async findOwned(
    id: string,
    ownerFilter: QueryFilter<BookingDocument>,
  ): Promise<BookingDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Booking not found');
    }
    const booking = await this.bookingModel.findOne({
      _id: new Types.ObjectId(id),
      ...ownerFilter,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private async releaseCoachSlot(slotId: Types.ObjectId) {
    await this.slotModel.updateOne(
      { _id: slotId, status: CoachSlotStatus.BOOKED },
      { $set: { status: CoachSlotStatus.OPEN } },
    );
  }

  private generateCode(): string {
    return `BK-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  // ── Notifications ──────────────────────────────────────────────────────

  private async notifyConfirmed(booking: BookingDocument) {
    const clubName = await this.resolveClubName(booking);
    await this.notifications.dispatch({
      userId: booking.athleteId,
      templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
      params: {
        clubName: clubName ?? 'Gym4Me',
        date:
          booking.occurrence?.date ??
          booking.startsAt.toISOString().slice(0, 10),
        time:
          booking.occurrence?.startTime ?? formatTimeTehran(booking.startsAt),
      },
      payload: { bookingId: booking._id.toString(), code: booking.code },
      critical: true,
      idempotencyKey: `booking.confirmed:${booking._id.toString()}`,
    });

    // R3: enqueue domain event (worker marks published; notifications already sent).
    try {
      await this.outbox.enqueue({
        eventName: 'booking.confirmed',
        payload: {
          bookingId: booking._id.toString(),
          code: booking.code,
          athleteId: booking.athleteId.toString(),
          clubId: booking.clubId?.toString() ?? null,
        },
        idempotencyKey: `outbox:booking.confirmed:${booking._id.toString()}`,
      });
    } catch (err) {
      this.logger.warn(
        `Outbox enqueue failed for booking ${booking._id.toString()}: ${String(err)}`,
      );
    }
  }

  private async notifyProviderCancelled(booking: BookingDocument) {
    await this.notifications.dispatch({
      userId: booking.athleteId,
      templateKey: NotificationTemplateKey.BOOKING_CANCELLED_BY_PROVIDER,
      params: {
        subject: `رزرو ${booking.code}`,
        date:
          booking.occurrence?.date ??
          booking.startsAt.toISOString().slice(0, 10),
      },
      payload: { bookingId: booking._id.toString(), code: booking.code },
      critical: true,
      idempotencyKey: `booking.provider_cancelled:${booking._id.toString()}`,
    });
  }

  private async resolveClubName(
    booking: BookingDocument,
  ): Promise<string | null> {
    if (!booking.clubId) return null;
    const club = await this.clubModel
      .findById(booking.clubId)
      .select({ identity: 1 });
    return club?.identity?.name ?? null;
  }

  // ── Projection ─────────────────────────────────────────────────────────

  private async project(booking: BookingDocument, audience: Audience) {
    const [projected] = await this.projectMany([booking], audience);
    return projected;
  }

  private async projectMany(bookings: BookingDocument[], audience: Audience) {
    const userIds = new Set<string>();
    for (const booking of bookings) {
      // Athlete audience sees the coach; provider audiences see the athlete.
      if (audience === 'athlete') {
        if (booking.coachUserId) userIds.add(booking.coachUserId.toString());
      } else {
        userIds.add(booking.athleteId.toString());
      }
    }
    const clubIds = [
      ...new Set(
        bookings
          .map((booking) => booking.clubId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    // Resolve club-slot targets (class / space titles) for club bookings.
    const clubSlotIds = [
      ...new Set(
        bookings
          .filter(
            (booking) => booking.resource.type !== BookingResourceType.COACH,
          )
          .map((booking) => booking.resource.refId.toString()),
      ),
    ];

    const usersPromise: Promise<UserDocument[]> = userIds.size
      ? this.userModel
          .find({
            _id: { $in: [...userIds].map((id) => new Types.ObjectId(id)) },
          })
          .select({ name: 1, avatar: 1, code: 1 })
      : Promise.resolve([]);
    const clubsPromise: Promise<ClubDocument[]> = clubIds.length
      ? this.clubModel
          .find({ _id: { $in: clubIds.map((id) => new Types.ObjectId(id)) } })
          .select({ identity: 1, location: 1 })
      : Promise.resolve([]);
    const [users, clubs, targetBySlotId] = await Promise.all([
      usersPromise,
      clubsPromise,
      this.resolveClubSlotTargets(clubSlotIds),
    ]);

    const userById = new Map(users.map((user) => [user._id.toString(), user]));
    const clubById = new Map(clubs.map((club) => [club._id.toString(), club]));

    return bookings.map((booking) => {
      const isCoachBooking =
        booking.resource.type === BookingResourceType.COACH;
      const counterpartId =
        audience === 'athlete'
          ? booking.coachUserId?.toString()
          : booking.athleteId.toString();
      const counterpart = counterpartId
        ? userById.get(counterpartId)
        : undefined;
      const club = booking.clubId
        ? clubById.get(booking.clubId.toString())
        : undefined;
      const target = !isCoachBooking
        ? targetBySlotId.get(booking.resource.refId.toString())
        : undefined;

      const counterpartProjection = counterpart
        ? {
            id: counterpart._id.toString(),
            name: {
              first: counterpart.name?.first ?? null,
              last: counterpart.name?.last ?? null,
            },
            avatar: {
              mediaId: counterpart.avatar?.mediaId?.toString() ?? null,
            },
            code: counterpart.code ?? null,
          }
        : null;

      return {
        id: booking._id.toString(),
        code: booking.code,
        status: booking.status,
        /** Unpaid-booking auto-cancel deadline (SYS-D13); null once paid/free. */
        paymentExpiresAt: booking.paymentExpiresAt ?? null,
        approvalExpiresAt: booking.approvalExpiresAt ?? null,
        resource: {
          type: booking.resource.type,
          refId: booking.resource.refId.toString(),
          title: target?.title ?? null,
          coverMediaId: target?.coverMediaId ?? null,
        },
        consultationKind: booking.consultationKind ?? null,
        occurrence: booking.occurrence
          ? {
              date: booking.occurrence.date,
              startTime: booking.occurrence.startTime,
              endTime: booking.occurrence.endTime,
            }
          : null,
        recurringGroupId: booking.recurringGroupId?.toString() ?? null,
        attendeeCount: booking.attendeeCount ?? 1,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        coach: audience === 'athlete' ? counterpartProjection : undefined,
        athlete: audience !== 'athlete' ? counterpartProjection : undefined,
        coachUserId: booking.coachUserId?.toString() ?? null,
        athleteId: booking.athleteId.toString(),
        slotId: booking.slotId?.toString() ?? booking.resource.refId.toString(),
        club: club
          ? {
              id: club._id.toString(),
              name: club.identity?.name ?? '',
              address: club.location?.address ?? null,
            }
          : null,
        intake: {
          note: booking.intake?.note ?? null,
          medicalConditionKeys: booking.intake?.medicalConditionKeys ?? [],
          supplementKeys: booking.intake?.supplementKeys ?? [],
        },
        pricing: {
          amount: booking.pricing.amount,
          discount: booking.pricing.discount,
          couponCode: booking.pricing.couponCode ?? null,
          total: booking.pricing.total,
        },
        payment: booking.payment
          ? {
              refId: booking.payment.refId ?? null,
              paidAt: booking.payment.paidAt ?? null,
            }
          : null,
        cancellation: booking.cancellation
          ? {
              reasonKey: booking.cancellation.reasonKey ?? null,
              note: booking.cancellation.note ?? null,
              cancelledAt: booking.cancellation.cancelledAt,
              cancelledBy: booking.cancellation.cancelledBy,
            }
          : null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      };
    });
  }

  /** Map ClubSlot id → display target (class / space title, cover). */
  private async resolveClubSlotTargets(
    slotIds: string[],
  ): Promise<
    Map<string, { title: string | null; coverMediaId: string | null }>
  > {
    const out = new Map<
      string,
      { title: string | null; coverMediaId: string | null }
    >();
    if (!slotIds.length) return out;

    const slots = await this.clubSlots.findSlotsByIds(slotIds);
    const classIds = [
      ...new Set(
        slots
          .map((slot) => slot.classId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const spaceIds = [
      ...new Set(
        slots
          .map((slot) => slot.spaceId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [classes, spaces] = await Promise.all([
      classIds.length
        ? this.classModel.find({
            _id: { $in: classIds.map((id) => new Types.ObjectId(id)) },
          })
        : Promise.resolve([] as ClubClassDocument[]),
      spaceIds.length
        ? this.spaceModel.find({
            _id: { $in: spaceIds.map((id) => new Types.ObjectId(id)) },
          })
        : Promise.resolve([] as ClubSpaceDocument[]),
    ]);
    const classById = new Map(classes.map((c) => [c._id.toString(), c]));
    const spaceById = new Map(spaces.map((s) => [s._id.toString(), s]));

    for (const slot of slots) {
      const classDoc = slot.classId
        ? classById.get(slot.classId.toString())
        : undefined;
      const spaceDoc = slot.spaceId
        ? spaceById.get(slot.spaceId.toString())
        : undefined;
      out.set(slot._id.toString(), {
        title: classDoc?.title ?? spaceDoc?.title ?? null,
        coverMediaId:
          classDoc?.media?.coverMediaId?.toString() ??
          spaceDoc?.media?.coverMediaId?.toString() ??
          null,
      });
    }
    return out;
  }
}

/** HH:mm wall-clock in Tehran for a stored UTC date. */
function formatTimeTehran(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
