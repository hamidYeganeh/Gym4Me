import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  PaymentChannel,
  PaymentPurpose,
  PaymentRefundMethod,
  PaymentStatus,
} from '../common/enums';
import { User } from './user.schema';

export type PaymentDocument = HydratedDocument<Payment>;

/**
 * Marketplace payment split (Tomans).
 * Identity: gross − discount − tax − providerShare − platformFee − gatewayFee = net.
 */
@Schema({ _id: false })
export class PaymentAmountSplit {
  @Prop({ required: true, default: 'finance-split-v1', trim: true })
  pricingVersion!: string;

  @Prop({ required: true, min: 0 })
  gross!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax!: number;

  @Prop({ required: true, min: 0, default: 0 })
  providerShare!: number;

  @Prop({ required: true, min: 0, default: 0 })
  platformFee!: number;

  @Prop({ required: true, min: 0, default: 0 })
  gatewayFee!: number;

  @Prop({ required: true, min: 0 })
  net!: number;
}

export const PaymentAmountSplitSchema =
  SchemaFactory.createForClass(PaymentAmountSplit);

@Schema({ _id: false })
export class PaymentReference {
  @Prop({ required: true, trim: true })
  orderId!: string;

  @Prop({ trim: true })
  authority?: string;

  @Prop({ trim: true })
  gatewayRefId?: string;

  @Prop({ trim: true })
  externalRef?: string;

  /** Provider checkout URL persisted for idempotent initiation retries. */
  @Prop({ trim: true, maxlength: 500 })
  redirectUrl?: string;

  @Prop()
  initiatedAt?: Date;
}

export const PaymentReferenceSchema =
  SchemaFactory.createForClass(PaymentReference);

@Schema({ _id: false })
export class PaymentGuest {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  phone!: string;
}

export const PaymentGuestSchema = SchemaFactory.createForClass(PaymentGuest);

@Schema({ _id: false })
export class PaymentPayer {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;

  @Prop({ type: PaymentGuestSchema })
  guest?: PaymentGuest;
}

export const PaymentPayerSchema = SchemaFactory.createForClass(PaymentPayer);

@Schema({ _id: false })
export class PaymentOperator {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ trim: true })
  note?: string;
}

export const PaymentOperatorSchema =
  SchemaFactory.createForClass(PaymentOperator);

@Schema({ _id: false })
export class PaymentTender {
  @Prop({ type: String, enum: PaymentChannel, required: true })
  channel!: PaymentChannel;

  @Prop({ required: true, min: 1 })
  amount!: number;

  @Prop({ trim: true, maxlength: 120 })
  externalRef?: string;
}

export const PaymentTenderSchema = SchemaFactory.createForClass(PaymentTender);

@Schema({ _id: false })
export class PaymentRelated {
  @Prop({ type: Types.ObjectId })
  bookingId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  membershipId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  packageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  clubId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  coachUserId?: Types.ObjectId;
}

export const PaymentRelatedSchema =
  SchemaFactory.createForClass(PaymentRelated);

@Schema({ _id: false })
export class PaymentRefund {
  @Prop({ required: true, min: 1 })
  amount!: number;

  @Prop({ type: String, enum: PaymentRefundMethod, required: true })
  method!: PaymentRefundMethod;

  @Prop({ required: true, trim: true, maxlength: 240 })
  idempotencyKey!: string;

  @Prop({
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    required: true,
    default: 'pending',
  })
  status!: 'pending' | 'succeeded' | 'failed';

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  processedBy!: Types.ObjectId;

  @Prop({ trim: true, maxlength: 120 })
  providerCode?: string;

  @Prop({ trim: true, maxlength: 500 })
  providerMessage?: string;

  @Prop({ trim: true, maxlength: 1000 })
  lastError?: string;

  @Prop({ required: true })
  processedAt!: Date;

  @Prop()
  succeededAt?: Date;
}

export const PaymentRefundSchema = SchemaFactory.createForClass(PaymentRefund);

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({
    type: String,
    enum: PaymentPurpose,
    required: true,
    index: true,
  })
  purpose!: PaymentPurpose;

  @Prop({
    type: String,
    enum: PaymentChannel,
    required: true,
    index: true,
  })
  channel!: PaymentChannel;

  @Prop({
    type: String,
    enum: PaymentStatus,
    required: true,
    default: PaymentStatus.PENDING,
    index: true,
  })
  status!: PaymentStatus;

  @Prop({ type: PaymentAmountSplitSchema, required: true })
  amount!: PaymentAmountSplit;

  @Prop({ type: PaymentReferenceSchema, required: true })
  reference!: PaymentReference;

  @Prop({ type: PaymentPayerSchema, required: true })
  payer!: PaymentPayer;

  /** Desk / reception operator for manual channels. */
  @Prop({ type: PaymentOperatorSchema })
  operator?: PaymentOperator;

  /** Exact channel breakdown for mixed desk payments. */
  @Prop({ type: [PaymentTenderSchema], default: undefined })
  tenders?: PaymentTender[];

  @Prop({ type: PaymentRelatedSchema, default: () => ({}) })
  related!: PaymentRelated;

  @Prop({ required: true, unique: true, trim: true })
  idempotencyKey!: string;

  @Prop()
  capturedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  refundedAt?: Date;

  /** Cumulative amount returned to the payer, in Tomans. */
  @Prop({ required: true, min: 0, default: 0 })
  refundedAmount!: number;

  @Prop({ type: [PaymentRefundSchema], default: [] })
  refunds!: PaymentRefund[];

  @Prop()
  cancelledAt?: Date;

  /** Short-lived owner for the external gateway-create call. */
  @Prop({ trim: true })
  gatewayInitiationClaimId?: string;

  @Prop()
  gatewayInitiationClaimedAt?: Date;

  @Prop({ min: 0, default: 0 })
  reconciliationAttempts!: number;

  @Prop()
  lastReconciliationAt?: Date;

  @Prop({ trim: true, maxlength: 1000 })
  lastReconciliationError?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ 'related.clubId': 1, createdAt: -1 });
PaymentSchema.index({ 'payer.userId': 1, createdAt: -1 });
PaymentSchema.index({ 'reference.orderId': 1 });
