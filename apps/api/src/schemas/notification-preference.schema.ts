import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type NotificationPreferenceDocument =
  HydratedDocument<NotificationPreference>;

@Schema({ _id: false })
export class ChannelConsent {
  @Prop({ default: true })
  push!: boolean;

  @Prop({ default: true })
  sms!: boolean;

  @Prop({ default: true })
  inApp!: boolean;

  @Prop({ default: false })
  email!: boolean;

  @Prop({ default: false })
  marketing!: boolean;
}

export const ChannelConsentSchema =
  SchemaFactory.createForClass(ChannelConsent);

@Schema({ _id: false })
export class QuietHours {
  /** HH:mm local */
  @Prop({ trim: true, default: '22:00' })
  start!: string;

  /** HH:mm local */
  @Prop({ trim: true, default: '08:00' })
  end!: string;

  @Prop({ trim: true, default: 'Asia/Tehran' })
  timezone!: string;
}

export const QuietHoursSchema = SchemaFactory.createForClass(QuietHours);

/** Per-user channel consent + quiet hours (R4). */
@Schema({ timestamps: true, collection: 'notification_preferences' })
export class NotificationPreference {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: ChannelConsentSchema, default: () => ({}) })
  channels!: ChannelConsent;

  @Prop({ type: QuietHoursSchema, default: () => ({}) })
  quietHours!: QuietHours;

  /** Max marketing messages per day (frequency cap). */
  @Prop({ min: 0, default: 3 })
  marketingDailyCap!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);
