import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CoachAvailabilityDocument = HydratedDocument<CoachAvailability>;

@Schema({ _id: false })
export class CoachAvailabilityBuffers {
  @Prop({ required: true, min: 0, default: 0 })
  beforeMin!: number;

  @Prop({ required: true, min: 0, default: 0 })
  afterMin!: number;
}

export const CoachAvailabilityBuffersSchema = SchemaFactory.createForClass(
  CoachAvailabilityBuffers,
);

@Schema({ _id: false })
export class CoachAvailabilityLocation {
  @Prop({ type: Types.ObjectId, ref: Club.name })
  clubId?: Types.ObjectId;

  @Prop({ trim: true, maxlength: 120 })
  label?: string;

  @Prop({ trim: true, maxlength: 500 })
  address?: string;
}

export const CoachAvailabilityLocationSchema = SchemaFactory.createForClass(
  CoachAvailabilityLocation,
);

@Schema({ _id: false })
export class CoachAvailabilityTimeOff {
  @Prop({ type: Date, required: true })
  from!: Date;

  @Prop({ type: Date, required: true })
  to!: Date;

  @Prop({ trim: true, maxlength: 500 })
  reason?: string;
}

export const CoachAvailabilityTimeOffSchema = SchemaFactory.createForClass(
  CoachAvailabilityTimeOff,
);

/** Recurring weekly window; weekday 0=Sunday … 6=Saturday (JS Date.getDay). */
@Schema({ _id: false })
export class CoachAvailabilityWeeklyHour {
  @Prop({ required: true, min: 0, max: 6 })
  weekday!: number;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  startTime!: string;

  /** HH:mm */
  @Prop({ required: true, trim: true })
  endTime!: string;
}

export const CoachAvailabilityWeeklyHourSchema = SchemaFactory.createForClass(
  CoachAvailabilityWeeklyHour,
);

/**
 * Operational calendar prefs for a coach (buffers, locations, time-off).
 * Distinct from concrete `CoachSlot` bookable instances.
 */
@Schema({ timestamps: true, collection: 'coach_availabilities' })
export class CoachAvailability {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  coachUserId!: Types.ObjectId;

  @Prop({
    type: CoachAvailabilityBuffersSchema,
    default: () => ({ beforeMin: 0, afterMin: 0 }),
  })
  buffers!: CoachAvailabilityBuffers;

  @Prop({ type: [CoachAvailabilityLocationSchema], default: [] })
  locations!: CoachAvailabilityLocation[];

  @Prop({ type: [CoachAvailabilityTimeOffSchema], default: [] })
  timeOff!: CoachAvailabilityTimeOff[];

  @Prop({ type: [CoachAvailabilityWeeklyHourSchema], default: [] })
  weeklyHours?: CoachAvailabilityWeeklyHour[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachAvailabilitySchema =
  SchemaFactory.createForClass(CoachAvailability);
