import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SubscriptionRenewalMode } from '../common/enums';
import { User } from './user.schema';

export type PlatformSubscriptionCheckoutDocument =
  HydratedDocument<PlatformSubscriptionCheckout>;

export enum PlatformSubscriptionCheckoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ _id: false })
export class PlatformSubscriptionCheckoutPrice {
  @Prop({ required: true, min: 0 })
  gross!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  payable!: number;

  @Prop({ required: true, trim: true, default: 'IRT' })
  currency!: string;
}

const PlatformSubscriptionCheckoutPriceSchema = SchemaFactory.createForClass(
  PlatformSubscriptionCheckoutPrice,
);

@Schema({ timestamps: true, collection: 'platform_subscription_checkouts' })
export class PlatformSubscriptionCheckout {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PlatformPlan',
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlatformSubscription' })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  planName!: string;

  @Prop({ required: true, min: 1 })
  periodDays!: number;

  @Prop({
    type: String,
    enum: SubscriptionRenewalMode,
    default: SubscriptionRenewalMode.MANUAL,
  })
  renewalMode!: SubscriptionRenewalMode;

  @Prop({ type: PlatformSubscriptionCheckoutPriceSchema, required: true })
  price!: PlatformSubscriptionCheckoutPrice;

  @Prop({ required: true, trim: true, minlength: 64, maxlength: 64 })
  fingerprint!: string;

  @Prop({ required: true, trim: true, maxlength: 64 })
  consentVersion!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  idempotencyKey!: string;

  @Prop({
    type: String,
    enum: PlatformSubscriptionCheckoutStatus,
    default: PlatformSubscriptionCheckoutStatus.PENDING,
    index: true,
  })
  status!: PlatformSubscriptionCheckoutStatus;

  @Prop({ trim: true, maxlength: 120 })
  authority?: string;

  @Prop({ trim: true, maxlength: 1000 })
  redirectUrl?: string;

  @Prop({ trim: true, maxlength: 120 })
  gatewayRefId?: string;

  @Prop({ trim: true, maxlength: 100 })
  initiationClaimId?: string;

  @Prop()
  initiationClaimedAt?: Date;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop({ min: 0, default: 0 })
  reconciliationAttempts!: number;

  @Prop()
  lastReconciliationAt?: Date;

  @Prop({ trim: true, maxlength: 1000 })
  lastReconciliationError?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformSubscriptionCheckoutSchema = SchemaFactory.createForClass(
  PlatformSubscriptionCheckout,
);

PlatformSubscriptionCheckoutSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true },
);
PlatformSubscriptionCheckoutSchema.index({ status: 1, expiresAt: 1 });
PlatformSubscriptionCheckoutSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: PlatformSubscriptionCheckoutStatus.PENDING,
    },
  },
);
