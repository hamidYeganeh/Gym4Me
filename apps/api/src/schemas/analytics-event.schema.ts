import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AnalyticsEventName, Role } from '../common/enums';
import { User } from './user.schema';

export type AnalyticsEventDocument = HydratedDocument<AnalyticsEvent>;

@Schema({ _id: false })
export class AnalyticsActor {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;

  @Prop({ type: String, enum: Role })
  activeRole?: Role;
}

export const AnalyticsActorSchema =
  SchemaFactory.createForClass(AnalyticsActor);

@Schema({ _id: false })
export class AnalyticsContext {
  @Prop({ trim: true })
  source?: string;

  @Prop({ trim: true })
  platform?: string;

  @Prop({ trim: true })
  locale?: string;

  @Prop({ trim: true })
  timezone?: string;

  @Prop({ trim: true })
  correlationId?: string;

  @Prop({ type: Types.ObjectId })
  clubId?: Types.ObjectId;
}

export const AnalyticsContextSchema =
  SchemaFactory.createForClass(AnalyticsContext);

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'analytics_events' })
export class AnalyticsEvent {
  /** Client- or server-generated idempotency key. */
  @Prop({ required: true, unique: true })
  eventId!: string;

  @Prop({ type: String, enum: AnalyticsEventName, required: true, index: true })
  eventName!: AnalyticsEventName;

  @Prop({ required: true, index: true })
  occurredAt!: Date;

  @Prop({ default: 1 })
  schemaVersion!: number;

  @Prop({ type: AnalyticsActorSchema, default: () => ({}) })
  actor!: AnalyticsActor;

  @Prop({ type: AnalyticsContextSchema, default: () => ({}) })
  context!: AnalyticsContext;

  @Prop({ type: Object, default: {} })
  properties!: Record<string, unknown>;

  createdAt!: Date;
}

export const AnalyticsEventSchema =
  SchemaFactory.createForClass(AnalyticsEvent);

AnalyticsEventSchema.index({ eventName: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ 'actor.userId': 1, occurredAt: -1 });
