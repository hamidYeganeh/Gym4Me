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
import { MongoTransactionService } from '../../common/mongo/mongo-transaction.service';
import {
  paginatedResult,
  resolvePageSize,
} from '../../common/utils/pagination.util';
import {
  createSearchFilter,
  resolveListSort,
} from '../../common/utils/list-query.util';
import { FinanceService } from '../../finance/finance.service';
import {
  OutboxService,
  type OutboxNotification,
} from '../../outbox/outbox.service';
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
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
    private readonly transactions: MongoTransactionService,
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

    try {
      const booking = await this.transactions.run(async (session) => {
        if (dto.idempotencyKey) {
          const existing = await this.bookingModel
            .findOne({
              athleteId: new Types.ObjectId(athleteId),
              idempotencyKey: dto.idempotencyKey,
            })
            .session(session);
          if (existing) return existing;
        }

        // Slot occupation and booking creation commit together.
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

        // Coupons are reserved for the pricing engine; no silent discount.
        const discount = 0;
        const [created] = await this.bookingModel.create(
          [
            {
              code: this.generateCode(),
              idempotencyKey: dto.idempotencyKey,
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
            },
          ],
          { session },
        );
        if (!created) throw new Error('Booking was not created');
        return created;
      });
      return this.project(booking, 'athlete');
    } catch (error) {
      if (dto.idempotencyKey) {
        const existing = await this.bookingModel.findOne({
          athleteId: new Types.ObjectId(athleteId),
          idempotencyKey: dto.idempotencyKey,
        });
        if (existing) return this.project(existing, 'athlete');
      }
      throw error;
    }
  }

  // ── Athlete: club bookings (session / class / space) ──────────────────

  async createClubBooking(athleteId: string, dto: CreateClubBookingDto) {
    const dates = [...new Set(dto.dates)].sort();
    const idempotencyKeys = dto.idempotencyKey
      ? dates.map((date) => `${dto.idempotencyKey}:${date}`)
      : [];

    if (dto.idempotencyKey) {
      const existing = await this.bookingModel
        .find({
          athleteId: new Types.ObjectId(athleteId),
          idempotencyKey: { $in: idempotencyKeys },
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
    let transactionResult: {
      recurringGroupId?: Types.ObjectId;
      created: BookingDocument[];
    };
    try {
      transactionResult = await this.transactions.run(async (session) => {
        const club = await this.clubModel
          .findById(new Types.ObjectId(dto.clubId))
          .session(session);
        if (!club) throw new NotFoundException('Club not found');

        if (dto.idempotencyKey) {
          const existing = await this.bookingModel
            .find({
              athleteId: new Types.ObjectId(athleteId),
              idempotencyKey: { $in: idempotencyKeys },
            })
            .sort({ startsAt: 1 })
            .session(session);
          if (existing.length === dates.length) {
            return {
              recurringGroupId: existing[0]?.recurringGroupId,
              created: existing,
            };
          }
          if (existing.length > 0) {
            throw new ConflictException(
              'A partial booking retry exists; refresh bookings before retrying',
            );
          }
        }

        // Mongo transactions do not support parallel operations on one session.
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

        const now = Date.now();
        for (const { occurrence } of resolved) {
          const startsAt = occurrenceDate(
            occurrence.date,
            occurrence.startTime,
          );
          if (startsAt.getTime() <= now) {
            throw new BadRequestException(
              `Occurrence ${occurrence.date} is in the past`,
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
        const created: BookingDocument[] = [];

        for (const { occurrence } of resolved) {
          const ok = await this.clubSlots.occupyOccurrence(
            slot._id,
            occurrence.date,
            attendeeCount,
            slot.capacity,
            session,
          );
          if (!ok) {
            throw new ConflictException(
              `Occurrence ${occurrence.date} is fully booked`,
            );
          }

          const amount = price * attendeeCount;
          const [booking] = await this.bookingModel.create(
            [
              {
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
                paymentExpiresAt:
                  amount === 0 ? undefined : this.paymentExpiresAt(),
              },
            ],
            { session },
          );
          if (!booking) throw new Error('Booking was not created');
          created.push(booking);

          if (amount === 0) {
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
                      date: occurrence.date,
                      time: occurrence.startTime,
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

        return { recurringGroupId, created };
      });
    } catch (error) {
      if (dto.idempotencyKey) {
        const existing = await this.bookingModel
          .find({
            athleteId: new Types.ObjectId(athleteId),
            idempotencyKey: { $in: idempotencyKeys },
          })
          .sort({ startsAt: 1 });
        if (existing.length === dates.length) {
          return {
            recurringGroupId: existing[0]?.recurringGroupId?.toString() ?? null,
            bookings: await this.projectMany(existing, 'athlete'),
          };
        }
      }
      throw error;
    }

    const bookings = await this.projectMany(
      transactionResult.created,
      'athlete',
    );
    return {
      recurringGroupId: transactionResult.recurringGroupId?.toString() ?? null,
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

    const clubName = await this.resolveClubName(booking);
    const committed = await this.transactions.run(async (session) => {
      const current = await this.bookingModel
        .findOne({ _id: booking._id, athleteId: booking.athleteId })
        .session(session);
      if (!current) throw new NotFoundException('Booking not found');
      if (current.status === BookingStatus.CONFIRMED) {
        return {
          booking: current,
          paymentDto: null,
          paymentResult: null,
        };
      }
      if (current.status !== BookingStatus.AWAITING_PAYMENT) {
        throw new ConflictException('Booking is not awaiting payment');
      }
      if (current.payment?.authority !== dto.authority) {
        throw new BadRequestException('Unknown payment authority');
      }

      current.payment = {
        ...current.payment,
        refId: verification.refId,
        paidAt: new Date(),
      };
      current.status = BookingStatus.CONFIRMED;
      current.paymentExpiresAt = undefined;
      current.markModified('payment');
      await current.save({ session });

      const paymentDto = {
        purpose: PaymentPurpose.BOOKING,
        channel: PaymentChannel.ZARINPAL,
        status: PaymentStatus.CAPTURED,
        amount: {
          gross: current.pricing.amount,
          discount: current.pricing.discount,
          net: current.pricing.total,
        },
        reference: {
          orderId: current.code,
          authority: dto.authority,
          gatewayRefId: verification.refId,
        },
        payer: { userId: athleteId },
        related: {
          bookingId: current._id.toString(),
          clubId: current.clubId?.toString(),
          coachUserId: current.coachUserId?.toString(),
        },
        idempotencyKey: `booking:${current._id.toString()}:pay:${dto.authority}`,
      };
      const paymentResult = await this.finance.recordPayment(paymentDto, {
        actorId: athleteId,
        session,
      });

      await this.outbox.enqueue(
        {
          eventName: 'booking.confirmed',
          payload: {
            bookingId: current._id.toString(),
            code: current.code,
            athleteId: current.athleteId.toString(),
            clubId: current.clubId?.toString() ?? null,
            notification: {
              userId: current.athleteId.toString(),
              templateKey: NotificationTemplateKey.BOOKING_CONFIRMED,
              params: {
                clubName: clubName ?? 'Gym4Me',
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
            },
          },
          idempotencyKey: `outbox:booking.confirmed:${current._id.toString()}`,
        },
        session,
      );

      return { booking: current, paymentDto, paymentResult };
    });

    if (committed.paymentDto && committed.paymentResult) {
      await this.finance.runPaymentPostCommitEffects(
        committed.paymentDto,
        { actorId: athleteId },
        committed.paymentResult,
      );
    }
    return this.project(committed.booking, 'athlete');
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
    audience: Audience,
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

  private generateCode(): string {
    return `BK-${randomBytes(4).toString('hex').toUpperCase()}`;
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
