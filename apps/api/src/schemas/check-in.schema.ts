import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CheckInMethod, CheckInSyncMode } from '../common/enums';
import { Booking } from './booking.schema';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CheckInDocument = HydratedDocument<CheckIn>;

@Schema({ _id: false })
export class CheckInSync {
  @Prop({
    type: String,
    enum: CheckInSyncMode,
    required: true,
    default: CheckInSyncMode.ONLINE,
  })
  mode!: CheckInSyncMode;

  @Prop()
  reconciledAt?: Date;

  /**
   * Client-generated key for offline batch dedupe.
   * Sparse unique index on the parent document.
   */
  @Prop({ trim: true, maxlength: 120 })
  clientIdempotencyKey?: string;
}

export const CheckInSyncSchema = SchemaFactory.createForClass(CheckInSync);

@Schema({ timestamps: true, collection: 'check_ins' })
export class CheckIn {
  @Prop({ type: Types.ObjectId, ref: Club.name, index: true })
  clubId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Booking.name, index: true })
  bookingId?: Types.ObjectId;

  /** Future ClubMembership ref — stored as ObjectId until memberships land. */
  @Prop({ type: Types.ObjectId, index: true })
  membershipId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: CheckInMethod, required: true })
  method!: CheckInMethod;

  @Prop({ type: CheckInSyncSchema, required: true })
  sync!: CheckInSync;

  /** Desk staff / owner who recorded the check-in (optional for self). */
  @Prop({ type: Types.ObjectId, ref: User.name })
  recordedBy?: Types.ObjectId;

  @Prop({ required: true, index: true })
  occurredAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);

CheckInSchema.index(
  { 'sync.clientIdempotencyKey': 1 },
  {
    unique: true,
    sparse: true,
  },
);
CheckInSchema.index({ clubId: 1, occurredAt: -1 });
CheckInSchema.index({ userId: 1, occurredAt: -1 });
CheckInSchema.index(
  { bookingId: 1 },
  { unique: true, sparse: true, name: 'unique_booking_checkin' },
);
