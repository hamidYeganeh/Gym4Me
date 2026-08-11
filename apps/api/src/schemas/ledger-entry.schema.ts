import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  LedgerAccount,
  LedgerEntryKind,
  WalletOwnerType,
} from '../common/enums';
import {
  PaymentAmountSplit,
  PaymentAmountSplitSchema,
  PaymentRelated,
  PaymentRelatedSchema,
} from './payment.schema';
import { Payment } from './payment.schema';

export type LedgerEntryDocument = HydratedDocument<LedgerEntry>;

@Schema({ _id: false })
export class LedgerParty {
  @Prop({ type: String, enum: WalletOwnerType, required: true })
  type!: WalletOwnerType;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const LedgerPartySchema = SchemaFactory.createForClass(LedgerParty);

@Schema({ _id: false })
export class LedgerLine {
  @Prop({ type: String, enum: LedgerAccount, required: true })
  account!: LedgerAccount;

  @Prop({ required: true, min: 0, default: 0 })
  debit!: number;

  @Prop({ required: true, min: 0, default: 0 })
  credit!: number;

  @Prop({ type: LedgerPartySchema })
  party?: LedgerParty;
}

export const LedgerLineSchema = SchemaFactory.createForClass(LedgerLine);

/**
 * Immutable double-entry ledger — source of truth for all money movement.
 * Never update or delete documents; post reversing entries instead.
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'ledger_entries',
})
export class LedgerEntry {
  @Prop({
    type: String,
    enum: LedgerEntryKind,
    required: true,
    index: true,
  })
  kind!: LedgerEntryKind;

  @Prop({ type: Types.ObjectId, ref: Payment.name, index: true })
  paymentId?: Types.ObjectId;

  @Prop({ type: [LedgerLineSchema], required: true, default: [] })
  lines!: LedgerLine[];

  /** Snapshot of the payment split at posting time. */
  @Prop({ type: PaymentAmountSplitSchema, required: true })
  split!: PaymentAmountSplit;

  @Prop({ type: PaymentRelatedSchema, default: () => ({}) })
  related!: PaymentRelated;

  @Prop({ required: true, unique: true, trim: true })
  dedupeKey!: string;

  @Prop({ required: true, index: true })
  occurredAt!: Date;

  @Prop({ trim: true })
  note?: string;

  createdAt!: Date;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);

LedgerEntrySchema.index({ 'related.clubId': 1, occurredAt: -1 });
LedgerEntrySchema.index({ kind: 1, occurredAt: -1 });
