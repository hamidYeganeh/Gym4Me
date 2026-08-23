import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  EntityStatus,
  SlotExceptionStatus,
  SlotKind,
  SlotRecurrenceType,
} from '../common/enums';
import { User } from './user.schema';

export type ClubSlotDocument = HydratedDocument<ClubSlot>;

@Schema({ _id: false })
export class SlotRecurrence {
  @Prop({ type: String, enum: SlotRecurrenceType, required: true })
  type!: SlotRecurrenceType;

  /** 0 = Saturday (Jalali week), required when type=weekly. */
  @Prop({ min: 0, max: 6 })
  weekday?: number;

  /** YYYY-MM-DD, required when type=once. */
  @Prop({ trim: true })
  date?: string;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  startTime!: string;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  endTime!: string;

  /** YYYY-MM-DD inclusive start for weekly series. */
  @Prop({ trim: true })
  startsOn?: string;

  /** YYYY-MM-DD inclusive end for weekly series. */
  @Prop({ trim: true })
  endsOn?: string;
}

export const SlotRecurrenceSchema =
  SchemaFactory.createForClass(SlotRecurrence);

@Schema({ _id: false })
export class SlotException {
  /** YYYY-MM-DD */
  @Prop({ required: true, trim: true })
  date!: string;

  @Prop({
    type: String,
    enum: SlotExceptionStatus,
    default: SlotExceptionStatus.CANCELLED,
  })
  status!: SlotExceptionStatus;
}

export const SlotExceptionSchema = SchemaFactory.createForClass(SlotException);

@Schema({ _id: false })
export class SlotSchedule {
  @Prop({ type: SlotRecurrenceSchema, required: true })
  recurrence!: SlotRecurrence;

  @Prop({ type: [SlotExceptionSchema], default: [] })
  exceptions!: SlotException[];
}

export const SlotScheduleSchema = SchemaFactory.createForClass(SlotSchedule);

@Schema({ timestamps: true, collection: 'club_slots' })
export class ClubSlot {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: String, enum: SlotKind, required: true, index: true })
  kind!: SlotKind;

  /** Required when kind=class. */
  @Prop({ type: Types.ObjectId, ref: 'ClubClass', index: true })
  classId?: Types.ObjectId;

  /** Required when kind=space. */
  @Prop({ type: Types.ObjectId, ref: 'ClubSpace', index: true })
  spaceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  capacity!: number;

  /** Price per seat per occurrence (Tomans); 0 = free. */
  @Prop({ min: 0, default: 0 })
  price!: number;

  @Prop({ type: SlotScheduleSchema, required: true })
  schedule!: SlotSchedule;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  /** Transactional serialization point for this bookable resource. */
  @Prop({ type: Number, default: 0, min: 0, select: false })
  calendarRevision!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubSlotSchema = SchemaFactory.createForClass(ClubSlot);

ClubSlotSchema.index({ clubId: 1, status: 1, kind: 1 });
ClubSlotSchema.index({ clubId: 1, 'schedule.recurrence.type': 1 });
