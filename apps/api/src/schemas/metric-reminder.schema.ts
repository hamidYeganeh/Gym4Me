import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MetricReminderChannel, MetricReminderStatus } from '../common/enums';
import { User } from './user.schema';

export type MetricReminderDocument = HydratedDocument<MetricReminder>;

@Schema({ _id: false })
export class MetricReminderSchedule {
  @Prop({ required: true, trim: true, maxlength: 64 })
  timezone!: string;

  /** 0=Sun … 6=Sat (local). Empty = every day. */
  @Prop({ type: [Number], default: [] })
  weekdays!: number[];

  /** Local wall-clock HH:mm. */
  @Prop({ required: true, trim: true, maxlength: 8 })
  localTime!: string;
}

export const MetricReminderScheduleSchema = SchemaFactory.createForClass(
  MetricReminderSchedule,
);

@Schema({ _id: false })
export class MetricReminderQuietHours {
  @Prop({ trim: true, maxlength: 8 })
  start?: string;

  @Prop({ trim: true, maxlength: 8 })
  end?: string;
}

export const MetricReminderQuietHoursSchema = SchemaFactory.createForClass(
  MetricReminderQuietHours,
);

/**
 * Opt-in metric reminders. Default status is paused until the athlete
 * explicitly activates (product: reminders default off).
 */
@Schema({ timestamps: true, collection: 'metric_reminders' })
export class MetricReminder {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 80, index: true })
  metricKey!: string;

  @Prop({ type: MetricReminderScheduleSchema, required: true })
  schedule!: MetricReminderSchedule;

  @Prop({ type: MetricReminderQuietHoursSchema })
  quietHours?: MetricReminderQuietHours;

  @Prop({
    type: String,
    enum: MetricReminderChannel,
    default: MetricReminderChannel.PUSH,
  })
  channel!: MetricReminderChannel;

  @Prop({
    type: String,
    enum: MetricReminderStatus,
    default: MetricReminderStatus.PAUSED,
    index: true,
  })
  status!: MetricReminderStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MetricReminderSchema =
  SchemaFactory.createForClass(MetricReminder);

MetricReminderSchema.index(
  { athleteUserId: 1, metricKey: 1 },
  { unique: true },
);
