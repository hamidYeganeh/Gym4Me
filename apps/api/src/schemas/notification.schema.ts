import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  NotificationDeliveryStatus,
  NotificationReadStatus,
} from '../common/enums';
import { User } from './user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ _id: false })
export class NotificationChannelDelivery {
  @Prop({
    type: String,
    enum: NotificationDeliveryStatus,
    required: true,
  })
  status!: NotificationDeliveryStatus;

  @Prop()
  sentAt?: Date;

  @Prop({ trim: true })
  error?: string;
}

export const NotificationChannelDeliverySchema = SchemaFactory.createForClass(
  NotificationChannelDelivery,
);

@Schema({ _id: false })
export class NotificationDelivery {
  @Prop({ type: NotificationChannelDeliverySchema })
  push?: NotificationChannelDelivery;

  @Prop({ type: NotificationChannelDeliverySchema })
  sms?: NotificationChannelDelivery;
}

export const NotificationDeliverySchema =
  SchemaFactory.createForClass(NotificationDelivery);

/** In-app inbox item + delivery record for push/SMS attempts (N3). */
@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  templateKey!: string;

  /** Rendered (post-placeholder) copy at send time. */
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  body!: string;

  /** Structured context for client deep-links (bookingId, clubId, …). */
  @Prop({ type: Object })
  payload?: Record<string, unknown>;

  @Prop({
    type: String,
    enum: NotificationReadStatus,
    default: NotificationReadStatus.UNREAD,
    index: true,
  })
  readStatus!: NotificationReadStatus;

  @Prop({ type: NotificationDeliverySchema, default: () => ({}) })
  delivery!: NotificationDelivery;

  /** Prevents duplicate sends when triggers retry (payment callbacks, crons). */
  @Prop({ trim: true, unique: true, sparse: true })
  idempotencyKey?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 });
