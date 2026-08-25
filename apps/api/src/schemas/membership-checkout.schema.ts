import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MembershipPlanKind } from '../common/enums';
import { User } from './user.schema';

export type MembershipCheckoutDocument = HydratedDocument<MembershipCheckout>;

export enum MembershipCheckoutMode {
  PURCHASE = 'purchase',
  RENEWAL = 'renewal',
}

export enum MembershipCheckoutStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ _id: false })
export class MembershipCheckoutPrice {
  @Prop({ required: true, min: 0 })
  gross!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  payable!: number;

  @Prop({ required: true, trim: true, default: 'IRT' })
  currency!: string;
}

const MembershipCheckoutPriceSchema = SchemaFactory.createForClass(
  MembershipCheckoutPrice,
);

@Schema({ _id: false })
export class MembershipCheckoutCredit {
  @Prop({ min: 0 })
  remainingSessions?: number;

  @Prop({ min: 0 })
  remainingEntries?: number;

  @Prop()
  expiresAt?: Date;
}

const MembershipCheckoutCreditSchema = SchemaFactory.createForClass(
  MembershipCheckoutCredit,
);

@Schema({ _id: false })
export class MembershipCheckoutGrant {
  @Prop({ min: 1 })
  durationDays?: number;

  @Prop({ min: 1 })
  sessions?: number;

  @Prop({ min: 1 })
  entries?: number;
}

const MembershipCheckoutGrantSchema = SchemaFactory.createForClass(
  MembershipCheckoutGrant,
);

@Schema({ timestamps: true, collection: 'membership_checkouts' })
export class MembershipCheckout {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClubMembershipPlan',
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ClubMembership' })
  membershipId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  @Prop({ type: String, enum: MembershipCheckoutMode, required: true })
  mode!: MembershipCheckoutMode;

  @Prop({ type: String, enum: MembershipPlanKind, required: true })
  planKind!: MembershipPlanKind;

  @Prop({ required: true, trim: true, maxlength: 200 })
  planName!: string;

  @Prop({ type: MembershipCheckoutPriceSchema, required: true })
  price!: MembershipCheckoutPrice;

  @Prop({ type: MembershipCheckoutCreditSchema, required: true })
  currentCredit!: MembershipCheckoutCredit;

  @Prop({ type: MembershipCheckoutCreditSchema, required: true })
  resultingCredit!: MembershipCheckoutCredit;

  @Prop({ type: MembershipCheckoutGrantSchema, required: true })
  creditGrant!: MembershipCheckoutGrant;

  @Prop({ required: true, trim: true, minlength: 64, maxlength: 64 })
  fingerprint!: string;

  @Prop({ required: true, trim: true, maxlength: 64 })
  consentVersion!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  idempotencyKey!: string;

  @Prop({
    type: String,
    enum: MembershipCheckoutStatus,
    default: MembershipCheckoutStatus.PENDING,
    index: true,
  })
  status!: MembershipCheckoutStatus;

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

export const MembershipCheckoutSchema =
  SchemaFactory.createForClass(MembershipCheckout);

MembershipCheckoutSchema.index({ userId: 1, createdAt: -1 });
MembershipCheckoutSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true },
);
MembershipCheckoutSchema.index({ status: 1, expiresAt: 1 });
MembershipCheckoutSchema.index(
  { userId: 1, membershipId: 1, status: 1 },
  { partialFilterExpression: { membershipId: { $type: 'objectId' } } },
);
MembershipCheckoutSchema.index(
  { membershipId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      membershipId: { $type: 'objectId' },
      status: MembershipCheckoutStatus.PENDING,
    },
  },
);
