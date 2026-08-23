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
import { Model, Types, type ClientSession, type QueryFilter } from 'mongoose';
import {
  BookingActor,
  BookingResourceType,
  BookingStatus,
  CoachSlotStatus,
  ConsultationKind,
  NotificationTemplateKey,
  SlotKind,
} from '../../common/enums';
import { PaymentGatewayService } from '../../common/payment';
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../../common/utils/list-query.util';
import {
  OutboxService,
  type OutboxNotification,
} from '../../outbox/outbox.service';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { Club, ClubDocument } from '../../schemas/club.schema';
import { CoachSlot, CoachSlotDocument } from '../../schemas/coach-slot.schema';
import { ClubSlotsService } from '../club-slots/club-slots.service';
import { CreateClubBookingCommand } from './application/commands/create-club-booking.command';
import { CreateCoachBookingCommand } from './application/commands/create-coach-booking.command';
import { VerifyBookingPaymentCommand } from './application/commands/verify-booking-payment.command';
import {
  BookingProjector,
  type BookingAudience,
} from './application/projectors/booking.projector';
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

type BookingListQuery = {
  page?: number;
  page_size?: number;
  limit?: number;
  status?: BookingStatus | BookingStatus[];
  bucket?: 'upcoming' | 'past' | 'cancelled';
  from?: string;
  to?: string;
  resource_type?: BookingResourceType;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const BOOKING_SORT_FIELDS = {
  startsAt: 'startsAt',
  endsAt: 'endsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  code: 'code',
  status: 'status',
  total: 'pricing.total',
} as const;

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
    @InjectModel(Club.name)
    private readonly clubModel: Model<ClubDocument>,
    private readonly clubSlots: ClubSlotsService,
    private readonly gateway: PaymentGatewayService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
    private readonly transactions: MongoTransactionService,
    private readonly createClubBookingCommand: CreateClubBookingCommand,
    private readonly createCoachBooking: CreateCoachBookingCommand,
    private readonly verifyBookingPayment: VerifyBookingPaymentCommand,
    private readonly projector: BookingProjector,
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
    const booking = await this.createCoachBooking.execute(athleteId, dto);
    return this.project(booking, 'athlete');
  }

  // ── Athlete: club bookings (session / class / space) ──────────────────

  async createClubBooking(athleteId: string, dto: CreateClubBookingDto) {
    const result = await this.createClubBookingCommand.execute(athleteId, dto);
    return {
      recurringGroupId: result.recurringGroupId?.toString() ?? null,
      bookings: await this.projectMany(result.bookings, 'athlete'),
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
    const verified = await this.verifyBookingPayment.execute(
      athleteId,
      booking,
      dto,
    );
    return this.project(verified, 'athlete');
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
    const updated = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findById(booking._id)
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');
      if (
        current.status !== BookingStatus.AWAITING_PAYMENT &&
        current.status !== BookingStatus.CONFIRMED
      ) {
        throw new ConflictException('Booking can no longer be rescheduled');
      }
      if (current.slotId?.toString() === dto.slotId) {
        throw new BadRequestException('Booking already uses this slot');
      }

      const newSlot = await this.slotModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(dto.slotId),
          coachUserId: current.coachUserId,
          status: CoachSlotStatus.OPEN,
          startsAt: { $gt: new Date() },
        },
        { $set: { status: CoachSlotStatus.BOOKED } },
        { new: true, session },
      );
      if (!newSlot) {
        throw new ConflictException('Selected slot is no longer available');
      }

      const previousSlotId = current.slotId;
      if (!previousSlotId) {
        throw new ConflictException('Booking has no occupied coach slot');
      }
      current.rescheduledFromSlotId = previousSlotId;
      current.slotId = newSlot._id;
      current.resource = {
        type: BookingResourceType.COACH,
        refId: newSlot._id,
      };
      current.startsAt = newSlot.startsAt;
      current.endsAt = newSlot.endsAt;
      if (current.consultationKind === ConsultationKind.IN_PERSON) {
        current.clubId = newSlot.clubId;
      }
      current.markModified('resource');
      await current.save({ session });
      await this.releaseCoachSlot(previousSlotId, session);
      return current;
    });
    return this.project(updated, 'athlete');
  }

  private async rescheduleClubBooking(
    booking: BookingDocument,
    dto: RescheduleBookingDto,
  ) {
    if (!dto.date) {
      throw new BadRequestException('date is required');
    }
    const targetDate = dto.date;
    const updated = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findById(booking._id)
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');
      if (
        current.status !== BookingStatus.AWAITING_PAYMENT &&
        current.status !== BookingStatus.CONFIRMED
      ) {
        throw new ConflictException('Booking can no longer be rescheduled');
      }

      const targetSlotId = dto.slotId ?? current.resource.refId.toString();
      if (
        targetSlotId === current.resource.refId.toString() &&
        targetDate === current.occurrence?.date
      ) {
        throw new BadRequestException('Booking already uses this occurrence');
      }

      const { slot, occurrence } =
        await this.clubSlots.resolveBookableOccurrence(
          targetSlotId,
          targetDate,
          session,
        );
      if (slot.clubId.toString() !== current.clubId?.toString()) {
        throw new BadRequestException('Slot belongs to a different club');
      }
      if (SLOT_KIND_TO_RESOURCE[slot.kind] !== current.resource.type) {
        throw new BadRequestException('Slot kind does not match the booking');
      }
      const startsAt = occurrenceDate(occurrence.date, occurrence.startTime);
      if (startsAt.getTime() <= Date.now()) {
        throw new BadRequestException('Occurrence is in the past');
      }
      if (current.attendeeCount > slot.capacity) {
        throw new BadRequestException(
          'attendeeCount exceeds the occurrence capacity',
        );
      }

      const ok = await this.clubSlots.occupyOccurrence(
        slot._id,
        occurrence.date,
        current.attendeeCount,
        slot.capacity,
        session,
      );
      if (!ok) {
        throw new ConflictException('Selected occurrence is fully booked');
      }

      const previousRefId = current.resource.refId;
      const previousDate = current.occurrence?.date;
      if (!previousDate) {
        throw new ConflictException('Booking has no occupied occurrence');
      }

      current.resource = {
        type: SLOT_KIND_TO_RESOURCE[slot.kind],
        refId: slot._id,
      };
      current.occurrence = occurrence;
      current.startsAt = startsAt;
      current.endsAt = occurrenceDate(occurrence.date, occurrence.endTime);
      current.markModified('resource');
      current.markModified('occurrence');
      await current.save({ session });
      await this.clubSlots.releaseOccurrence(
        previousRefId,
        previousDate,
        current.attendeeCount,
        session,
      );
      return current;
    });
    return this.project(updated, 'athlete');
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

    const accepted = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findOne({
          _id: booking._id,
          coachUserId: new Types.ObjectId(coachUserId),
        })
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');
      if (current.status !== BookingStatus.PENDING) {
        throw new ConflictException('Booking is not awaiting coach approval');
      }

      current.approvalExpiresAt = undefined;
      if (current.pricing.total > 0) {
        current.status = BookingStatus.AWAITING_PAYMENT;
        current.paymentExpiresAt = this.paymentExpiresAt();
      } else {
        current.status = BookingStatus.CONFIRMED;
        current.paymentExpiresAt = undefined;
      }
      await current.save({ session });

      const confirmed = current.status === BookingStatus.CONFIRMED;
      let clubName = 'Gym4Me';
      if (confirmed && current.clubId) {
        const club = await this.clubModel
          .findById(current.clubId)
          .select({ 'identity.name': 1 })
          .session(session);
        clubName = club?.identity?.name ?? clubName;
      }
      const notification: OutboxNotification = confirmed
        ? {
            userId: current.athleteId.toString(),
            templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
            params: {
              clubName,
              date:
                current.occurrence?.date ??
                current.startsAt.toISOString().slice(0, 10),
              time:
                current.occurrence?.startTime ??
                formatTimeTehran(current.startsAt),
            },
            payload: {
              bookingId: current._id.toString(),
              code: current.code,
            },
            critical: true,
          }
        : {
            userId: current.athleteId.toString(),
            templateKey:
              NotificationTemplateKey.BOOKING_APPROVED_PAYMENT_REQUIRED,
            params: {
              deadline: current.paymentExpiresAt?.toISOString() ?? '',
            },
            payload: {
              bookingId: current._id.toString(),
              action: 'pay_booking',
            },
            critical: true,
          };
      await this.outbox.enqueue(
        {
          eventName: confirmed
            ? 'booking.confirmed'
            : 'booking.approved.payment_required',
          payload: {
            bookingId: current._id.toString(),
            athleteId: current.athleteId.toString(),
            notification,
          },
          idempotencyKey: confirmed
            ? `outbox:booking.confirmed:${current._id.toString()}`
            : `outbox:booking.approved:${current._id.toString()}`,
        },
        session,
      );
      return current;
    });
    return this.project(accepted, 'coach');
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
    audience: BookingAudience,
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
    audience: BookingAudience,
  ) {
    const providerCancel =
      actor === BookingActor.COACH || actor === BookingActor.CLUB;
    const systemExpire =
      actor === BookingActor.SYSTEM ||
      (actor === BookingActor.ADMIN && dto.reasonKey === 'payment_ttl_expired');
    const shouldNotifyAthlete =
      providerCancel ||
      actor === BookingActor.ADMIN ||
      actor === BookingActor.SYSTEM;

    const cancelled = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findById(booking._id)
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');

      const cancellable: BookingStatus[] = [
        BookingStatus.PENDING,
        BookingStatus.AWAITING_PAYMENT,
        BookingStatus.CONFIRMED,
      ];
      if (!cancellable.includes(current.status)) {
        throw new ConflictException('Booking can no longer be cancelled');
      }

      const wasPaid = Boolean(current.payment?.paidAt);
      let nextStatus: BookingStatus;
      if (systemExpire || current.status === BookingStatus.AWAITING_PAYMENT) {
        nextStatus = BookingStatus.CANCELLED;
      } else if (providerCancel && wasPaid) {
        nextStatus = BookingStatus.REFUND_REQUESTED;
      } else if (wasPaid) {
        const refundEligible = await this.isRefundEligible(current, session);
        nextStatus = refundEligible
          ? BookingStatus.REFUND_REQUESTED
          : BookingStatus.CANCELLED;
      } else if (providerCancel) {
        nextStatus = BookingStatus.REJECTED;
      } else {
        nextStatus = BookingStatus.CANCELLED;
      }

      current.status = nextStatus;
      current.paymentExpiresAt = undefined;
      current.approvalExpiresAt = undefined;
      current.cancellation = {
        reasonKey: dto.reasonKey,
        note: dto.note,
        cancelledAt: new Date(),
        cancelledBy: actor === BookingActor.SYSTEM ? BookingActor.ADMIN : actor,
      };
      current.markModified('cancellation');
      await current.save({ session });
      await this.releaseResource(current, session);

      if (shouldNotifyAthlete) {
        await this.outbox.enqueue(
          {
            eventName: 'booking.cancelled_by_provider',
            payload: {
              bookingId: current._id.toString(),
              code: current.code,
              athleteId: current.athleteId.toString(),
              clubId: current.clubId?.toString() ?? null,
              notification: {
                userId: current.athleteId.toString(),
                templateKey:
                  NotificationTemplateKey.BOOKING_CANCELLED_BY_PROVIDER,
                params: {
                  subject: `رزرو ${current.code}`,
                  date:
                    current.occurrence?.date ??
                    current.startsAt.toISOString().slice(0, 10),
                },
                payload: {
                  bookingId: current._id.toString(),
                  code: current.code,
                },
                critical: true,
              },
            },
            idempotencyKey: `outbox:booking.provider_cancelled:${current._id.toString()}`,
          },
          session,
        );
      }
      return current;
    });

    return this.project(cancelled, audience);
  }

  /** Apply club.cancellation rules: refund if hours remaining >= matching rule with feePercent < 100. */
  private async isRefundEligible(
    booking: BookingDocument,
    session?: ClientSession,
  ): Promise<boolean> {
    return (await this.cancellationFeePercent(booking, session)) < 100;
  }

  private async cancellationFeePercent(
    booking: BookingDocument,
    session?: ClientSession,
  ): Promise<number> {
    if (!booking.clubId) return 0;
    const club = await this.clubModel
      .findById(booking.clubId)
      .session(session ?? null)
      .lean();
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

  private async releaseResource(
    booking: BookingDocument,
    session?: ClientSession,
  ) {
    if (booking.resource.type === BookingResourceType.COACH) {
      if (booking.slotId) await this.releaseCoachSlot(booking.slotId, session);
      return;
    }
    if (booking.occurrence) {
      await this.clubSlots.releaseOccurrence(
        booking.resource.refId,
        booking.occurrence.date,
        booking.attendeeCount,
        session,
      );
    }
  }

  private async list(
    ownerFilter: QueryFilter<BookingDocument>,
    query: BookingListQuery,
    audience: BookingAudience,
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const filter: QueryFilter<BookingDocument> = { ...ownerFilter };

    if (query.resource_type) filter['resource.type'] = query.resource_type;

    if (query.search?.trim()) {
      filter.$and = [
        createSearchFilter(query.search, [
          'code',
          'intake.note',
          'pricing.couponCode',
          'cancellation.reasonKey',
          'cancellation.note',
        ]),
      ];
    }

    if (query.status) {
      filter.status = {
        $in: Array.isArray(query.status) ? query.status : [query.status],
      };
    } else if (query.bucket === 'upcoming') {
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

    const sort = resolveListSort(query, BOOKING_SORT_FIELDS, {
      startsAt: query.bucket === 'past' ? -1 : 1,
    });
    const total = await this.bookingModel.countDocuments(filter);
    const bookings = await this.bookingModel
      .find(filter)
      .sort(sort)
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

  private async releaseCoachSlot(
    slotId: Types.ObjectId,
    session?: ClientSession,
  ) {
    await this.slotModel.updateOne(
      { _id: slotId, status: CoachSlotStatus.BOOKED },
      { $set: { status: CoachSlotStatus.OPEN } },
      { session },
    );
  }

  // ── Projection ─────────────────────────────────────────────────────────

  private async project(booking: BookingDocument, audience: BookingAudience) {
    return this.projector.project(booking, audience);
  }

  private async projectMany(
    bookings: BookingDocument[],
    audience: BookingAudience,
  ) {
    return this.projector.projectMany(bookings, audience);
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
