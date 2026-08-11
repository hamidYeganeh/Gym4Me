import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  PaymentChannel,
  PaymentPurpose,
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

  createdAt!: Date;
  updatedAt!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ 'related.clubId': 1, createdAt: -1 });
PaymentSchema.index({ 'payer.userId': 1, createdAt: -1 });
PaymentSchema.index({ 'reference.orderId': 1 });
