import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  PlatformSubscriptionStatus,
  SubscriptionRenewalMode,
} from '../common/enums';
import { User } from './user.schema';
import {
  PlatformEntitlementContract,
  PlatformEntitlementContractSchema,
} from './platform-plan.schema';

export type PlatformSubscriptionDocument =
  HydratedDocument<PlatformSubscription>;

@Schema({ _id: false })
export class PlatformSubscriptionPeriod {
  @Prop({ type: Date, required: true })
  start!: Date;

  @Prop({ type: Date, required: true })
  end!: Date;
}

export const PlatformSubscriptionPeriodSchema = SchemaFactory.createForClass(
  PlatformSubscriptionPeriod,
);

@Schema({ _id: false })
export class PlatformSubscriptionRenewal {
  @Prop({
    type: String,
    enum: SubscriptionRenewalMode,
    default: SubscriptionRenewalMode.MANUAL,
  })
  mode!: SubscriptionRenewalMode;
}

export const PlatformSubscriptionRenewalSchema = SchemaFactory.createForClass(
  PlatformSubscriptionRenewal,
);

/** User's Gym4Me platform subscription (owners paying SaaS). */
@Schema({ timestamps: true, collection: 'platform_subscriptions' })
export class PlatformSubscription {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  /** Present only while this is the user's current entitlement. */
  @Prop({ trim: true, enum: ['current'] })
  currentEntitlementKey?: 'current';

  @Prop({
    type: Types.ObjectId,
    ref: 'PlatformPlan',
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: PlatformSubscriptionStatus,
    default: PlatformSubscriptionStatus.ACTIVE,
    index: true,
  })
  status!: PlatformSubscriptionStatus;

  @Prop({ type: PlatformSubscriptionPeriodSchema, required: true })
  period!: PlatformSubscriptionPeriod;

  @Prop({
    type: PlatformSubscriptionRenewalSchema,
    default: () => ({ mode: SubscriptionRenewalMode.MANUAL }),
  })
  renewal!: PlatformSubscriptionRenewal;

  @Prop({ type: PlatformEntitlementContractSchema })
  entitlementSnapshot?: PlatformEntitlementContract;

  @Prop({ type: Number, min: 1 })
  planVersion?: number;

  @Prop({ type: String, enum: ['free_plan', 'read_only'] })
  postExpirationModeSnapshot?: 'free_plan' | 'read_only';

  @Prop({ type: Types.ObjectId, ref: 'PlatformPlan' })
  fallbackPlanIdSnapshot?: Types.ObjectId;

  @Prop({ type: Date })
  graceEndsAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'PlatformPlan' })
  scheduledPlanId?: Types.ObjectId;

  @Prop({ type: Date })
  scheduledPlanEffectiveAt?: Date;

  @Prop({ type: Date })
  cancellationRequestedAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  cancellationReason?: string;

  @Prop({ type: Date })
  graceEnteredAt?: Date;

  @Prop({ type: Date })
  readOnlyAt?: Date;

  @Prop({ type: Date })
  fallbackAppliedAt?: Date;

  @Prop({ type: Date })
  entitlementBackfilledAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformSubscriptionSchema =
  SchemaFactory.createForClass(PlatformSubscription);

PlatformSubscriptionSchema.index({ userId: 1, status: 1 });
PlatformSubscriptionSchema.index({ planId: 1, status: 1 });
PlatformSubscriptionSchema.index({ 'period.end': 1, status: 1 });
PlatformSubscriptionSchema.index(
  { userId: 1, currentEntitlementKey: 1 },
  {
    unique: true,
    partialFilterExpression: { currentEntitlementKey: 'current' },
  },
);
