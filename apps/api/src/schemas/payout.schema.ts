import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  PayoutDisputeStatus,
  PayoutRecipientType,
  PayoutStatus,
} from '../common/enums';
import { LedgerEntry } from './ledger-entry.schema';

export type PayoutDocument = HydratedDocument<Payout>;

@Schema({ _id: false })
export class PayoutRecipient {
  @Prop({ type: String, enum: PayoutRecipientType, required: true })
  type!: PayoutRecipientType;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const PayoutRecipientSchema =
  SchemaFactory.createForClass(PayoutRecipient);

@Schema({ _id: false })
export class PayoutPeriod {
  @Prop({ required: true })
  from!: Date;

  @Prop({ required: true })
  to!: Date;
}

export const PayoutPeriodSchema = SchemaFactory.createForClass(PayoutPeriod);

@Schema({ _id: false })
export class PayoutDispute {
  @Prop({
    type: String,
    enum: PayoutDisputeStatus,
    required: true,
  })
  status!: PayoutDisputeStatus;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ required: true })
  openedAt!: Date;

  @Prop()
  resolvedAt?: Date;

  @Prop({ trim: true })
  resolutionNote?: string;
}

export const PayoutDisputeSchema = SchemaFactory.createForClass(PayoutDispute);

@Schema({ timestamps: true, collection: 'payouts' })
export class Payout {
  @Prop({ type: PayoutRecipientSchema, required: true })
  recipient!: PayoutRecipient;

  @Prop({
    type: String,
    enum: PayoutStatus,
    required: true,
    default: PayoutStatus.PENDING,
    index: true,
  })
  status!: PayoutStatus;

  /** Settlement amount in Tomans. */
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, default: 'IRT', trim: true })
  currency!: string;

  @Prop({ type: PayoutPeriodSchema, required: true })
  period!: PayoutPeriod;

  @Prop({ type: PayoutDisputeSchema })
  dispute?: PayoutDispute;

  @Prop()
  settledAt?: Date;

  @Prop({ type: Types.ObjectId, ref: LedgerEntry.name })
  ledgerEntryId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, index: true })
  clubId?: Types.ObjectId;

  @Prop({ trim: true })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);

PayoutSchema.index({ 'recipient.type': 1, 'recipient.id': 1, createdAt: -1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
