import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LifecycleSegmentDocument = HydratedDocument<LifecycleSegment>;

export enum LifecycleSegmentKind {
  EXPIRING_SOON = 'expiring_soon',
  LOW_CREDITS = 'low_credits',
  NO_VISIT = 'no_visit',
  INCOMPLETE_PAYMENT = 'incomplete_payment',
  TRIAL_UNCONVERTED = 'trial_unconverted',
}

@Schema({ timestamps: true, collection: 'lifecycle_segments' })
export class LifecycleSegment {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: LifecycleSegmentKind,
    required: true,
    index: true,
  })
  kind!: LifecycleSegmentKind;

  @Prop({ required: true, trim: true })
  name!: string;

  /** Rule parameters (days threshold, credits remaining, etc.). */
  @Prop({ type: Object, default: () => ({}) })
  rule!: Record<string, unknown>;

  @Prop({
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status!: 'active' | 'inactive';

  createdAt!: Date;
  updatedAt!: Date;
}

export const LifecycleSegmentSchema =
  SchemaFactory.createForClass(LifecycleSegment);

LifecycleSegmentSchema.index({ clubId: 1, kind: 1 }, { unique: true });

export type LifecycleJourneyDocument = HydratedDocument<LifecycleJourney>;

export enum LifecycleJourneyStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'lifecycle_journeys' })
export class LifecycleJourney {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: LifecycleSegmentKind,
    required: true,
    index: true,
  })
  segmentKind!: LifecycleSegmentKind;

  @Prop({
    type: String,
    enum: LifecycleJourneyStatus,
    default: LifecycleJourneyStatus.ACTIVE,
    index: true,
  })
  status!: LifecycleJourneyStatus;

  @Prop({ default: 0, min: 0 })
  step!: number;

  @Prop()
  nextActionAt?: Date;

  @Prop({ type: Object, default: () => ({}) })
  context!: Record<string, unknown>;

  createdAt!: Date;
  updatedAt!: Date;
}

export const LifecycleJourneySchema =
  SchemaFactory.createForClass(LifecycleJourney);

LifecycleJourneySchema.index(
  { clubId: 1, userId: 1, segmentKind: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: LifecycleJourneyStatus.ACTIVE },
  },
);
