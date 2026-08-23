import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CoachSlotStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CoachSlotDocument = HydratedDocument<CoachSlot>;

/**
 * A concrete bookable time window on a coach's calendar.
 * Coaches open slots explicitly; booking flips `status` open → booked.
 */
@Schema({ timestamps: true, collection: 'coach_slots' })
export class CoachSlot {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true })
  endsAt!: Date;

  @Prop({ min: 0, max: 240, default: 0 })
  bufferBeforeMinutes!: number;

  @Prop({ min: 0, max: 240, default: 0 })
  bufferAfterMinutes!: number;

  @Prop({ min: 0, max: 240, default: 0 })
  travelBufferMinutes!: number;

  /** Effective exclusive calendar window including buffers. */
  @Prop({ required: true })
  blockedStartsAt!: Date;

  @Prop({ required: true })
  blockedEndsAt!: Date;

  /** Optional in-person venue — must be a club the coach is affiliated with. */
  @Prop({ type: Types.ObjectId, ref: Club.name })
  clubId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: CoachSlotStatus,
    default: CoachSlotStatus.OPEN,
    index: true,
  })
  status!: CoachSlotStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachSlotSchema = SchemaFactory.createForClass(CoachSlot);

CoachSlotSchema.index({ coachUserId: 1, startsAt: 1 }, { unique: true });
CoachSlotSchema.index({ coachUserId: 1, status: 1, startsAt: 1 });
CoachSlotSchema.index({ coachUserId: 1, blockedStartsAt: 1, blockedEndsAt: 1 });
