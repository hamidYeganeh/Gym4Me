import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  BookingActor,
  BookingResourceType,
  BookingStatus,
  ConsultationKind,
} from '../common/enums';
import { Club } from './club.schema';
import { CoachSlot } from './coach-slot.schema';
import { User } from './user.schema';

export type BookingDocument = HydratedDocument<Booking>;

/**
 * What this booking reserves. `refId` points to a CoachSlot (type=coach)
 * or a ClubSlot (type=session|class|space).
 */
@Schema({ _id: false })
export class BookingResource {
  @Prop({ type: String, enum: BookingResourceType, required: true })
  type!: BookingResourceType;

  @Prop({ type: Types.ObjectId, required: true })
  refId!: Types.ObjectId;
}

export const BookingResourceSchema =
  SchemaFactory.createForClass(BookingResource);

/**
 * Concrete occurrence of a recurring club slot (session/class/space).
 * Coach bookings do not use this — their CoachSlot is already concrete.
 */
@Schema({ _id: false })
export class BookingOccurrence {
  /** YYYY-MM-DD */
  @Prop({ required: true, trim: true })
  date!: string;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  startTime!: string;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  endTime!: string;
}

export const BookingOccurrenceSchema =
  SchemaFactory.createForClass(BookingOccurrence);

/** Athlete-provided context collected in the reserve wizard. */
@Schema({ _id: false })
export class BookingIntake {
  @Prop({ trim: true })
  note?: string;

  @Prop({ type: [String], default: [] })
  medicalConditionKeys!: string[];

  @Prop({ type: [String], default: [] })
  supplementKeys!: string[];
}

export const BookingIntakeSchema = SchemaFactory.createForClass(BookingIntake);

/** Price snapshot at booking time (Tomans). */
@Schema({ _id: false })
export class BookingPricing {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount!: number;

  @Prop({ trim: true })
  couponCode?: string;

  @Prop({ required: true, min: 0 })
  total!: number;
}

export const BookingPricingSchema =
  SchemaFactory.createForClass(BookingPricing);

@Schema({ _id: false })
export class BookingPayment {
  @Prop({ trim: true })
  provider?: string;

  @Prop({ trim: true })
  authority?: string;

  @Prop({ trim: true })
  refId?: string;

  @Prop()
  paidAt?: Date;
}

export const BookingPaymentSchema =
  SchemaFactory.createForClass(BookingPayment);

@Schema({ _id: false })
export class BookingCancellation {
  /** RefItem slug from `cancellation_reason`. */
  @Prop({ trim: true })
  reasonKey?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ required: true })
  cancelledAt!: Date;

  @Prop({ type: String, enum: BookingActor, required: true })
  cancelledBy!: BookingActor;
}

export const BookingCancellationSchema =
  SchemaFactory.createForClass(BookingCancellation);

@Schema({ timestamps: true, collection: 'bookings' })
export class Booking {
  /** Short human-readable code shown on receipts / check-in. */
  @Prop({ required: true, unique: true, trim: true })
  code!: string;

  /** Client retry key, scoped to the athlete by a partial unique index. */
  @Prop({ trim: true, maxlength: 240 })
  idempotencyKey?: string;

  /** SHA-256 of the canonical create payload; prevents key reuse drift. */
  @Prop({ trim: true, minlength: 64, maxlength: 64, select: false })
  idempotencyFingerprint?: string;

  @Prop({ type: String, enum: ['athlete', 'desk'], default: 'athlete' })
  source!: 'athlete' | 'desk';

  @Prop({ type: String, enum: ['member', 'guest'], default: 'member' })
  holderType!: 'member' | 'guest';

  @Prop({ type: Types.ObjectId, ref: User.name })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteId!: Types.ObjectId;

  @Prop({ type: BookingResourceSchema, required: true })
  resource!: BookingResource;

  /** Coach bookings only. */
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachUserId?: Types.ObjectId;

  /** Coach bookings only — the concrete CoachSlot. */
  @Prop({ type: Types.ObjectId, ref: CoachSlot.name })
  slotId?: Types.ObjectId;

  /** Venue: coach in-person slot club, or the club owning the resource. */
  @Prop({ type: Types.ObjectId, ref: Club.name, index: true })
  clubId?: Types.ObjectId;

  /** Club resource snapshots used for cross-slot overlap protection. */
  @Prop({ type: Types.ObjectId, ref: 'ClubClass', index: true })
  classId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClubSpace', index: true })
  spaceId?: Types.ObjectId;

  /** Coach bookings only. */
  @Prop({ type: String, enum: ConsultationKind })
  consultationKind?: ConsultationKind;

  /** Club bookings only — resolved recurring occurrence. */
  @Prop({ type: BookingOccurrenceSchema })
  occurrence?: BookingOccurrence;

  /** Links occurrences of one recurring reservation series. */
  @Prop({ type: Types.ObjectId, index: true })
  recurringGroupId?: Types.ObjectId;

  /** Seats reserved against the resource capacity. */
  @Prop({ required: true, min: 1, default: 1 })
  attendeeCount!: number;

  /** Denormalized from the resolved slot/occurrence so display survives edits. */
  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true })
  endsAt!: Date;

  /** Effective calendar window; coach bookings include travel/rest buffers. */
  @Prop()
  calendarStartsAt?: Date;

  @Prop()
  calendarEndsAt?: Date;

  @Prop({ type: BookingIntakeSchema, default: () => ({}) })
  intake!: BookingIntake;

  @Prop({ type: BookingPricingSchema, required: true })
  pricing!: BookingPricing;

  @Prop({ type: BookingPaymentSchema })
  payment?: BookingPayment;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.AWAITING_PAYMENT,
    index: true,
  })
  status!: BookingStatus;

  /** When AWAITING_PAYMENT must auto-cancel and release capacity (SYS-D13). */
  @Prop({ index: true })
  paymentExpiresAt?: Date;

  /** Coach request decision deadline for PENDING consultations. */
  @Prop({ index: true })
  approvalExpiresAt?: Date;

  @Prop({ type: BookingCancellationSchema })
  cancellation?: BookingCancellation;

  @Prop({ type: Types.ObjectId, ref: CoachSlot.name })
  rescheduledFromSlotId?: Types.ObjectId;

  /** Monotonic sequence for idempotent reschedule side effects. */
  @Prop({ min: 0, default: 0 })
  rescheduleRevision!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ athleteId: 1, status: 1, startsAt: -1 });
BookingSchema.index({ coachUserId: 1, startsAt: -1 });
BookingSchema.index({ clubId: 1, startsAt: -1 });
BookingSchema.index({ 'resource.refId': 1, 'occurrence.date': 1, status: 1 });
BookingSchema.index(
  { athleteId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);
BookingSchema.index(
  { status: 1, paymentExpiresAt: 1 },
  {
    partialFilterExpression: {
      status: BookingStatus.AWAITING_PAYMENT,
      paymentExpiresAt: { $exists: true },
    },
  },
);
BookingSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slotId: { $exists: true },
      status: {
        $in: [
          BookingStatus.PENDING,
          BookingStatus.AWAITING_PAYMENT,
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
        ],
      },
    },
  },
);
