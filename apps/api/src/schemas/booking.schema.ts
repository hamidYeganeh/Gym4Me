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

  @Prop({ type: BookingCancellationSchema })
  cancellation?: BookingCancellation;

  @Prop({ type: Types.ObjectId, ref: CoachSlot.name })
  rescheduledFromSlotId?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ athleteId: 1, status: 1, startsAt: -1 });
BookingSchema.index({ coachUserId: 1, startsAt: -1 });
BookingSchema.index({ clubId: 1, startsAt: -1 });
BookingSchema.index({ 'resource.refId': 1, 'occurrence.date': 1, status: 1 });
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
