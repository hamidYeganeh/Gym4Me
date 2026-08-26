import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { InvoiceStatus } from '../common/enums';
import { Payment } from './payment.schema';
import { User } from './user.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ _id: false })
export class InvoiceLine {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, min: 1, default: 1 })
  qty!: number;

  /** Unit price in Tomans. */
  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ required: true, min: 0 })
  total!: number;
}

export const InvoiceLineSchema = SchemaFactory.createForClass(InvoiceLine);

@Schema({ _id: false })
export class InvoiceAmounts {
  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true, min: 0, default: 0 })
  discount!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  payable!: number;
}

export const InvoiceAmountsSchema =
  SchemaFactory.createForClass(InvoiceAmounts);

@Schema({ _id: false })
export class InvoiceParty {
  @Prop({ type: Types.ObjectId, ref: User.name })
  payerUserId?: Types.ObjectId;

  @Prop({ trim: true, maxlength: 160 })
  clubName?: string;

  @Prop({ type: Types.ObjectId })
  clubId?: Types.ObjectId;
}

export const InvoicePartySchema = SchemaFactory.createForClass(InvoiceParty);

/**
 * Display/document projection over Payment for receipt UI.
 * Ledger remains source of truth for money movement.
 */
@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({
    type: Types.ObjectId,
    ref: Payment.name,
    required: true,
    unique: true,
    index: true,
  })
  paymentId!: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true, maxlength: 40 })
  number!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    type: String,
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
    index: true,
  })
  status!: InvoiceStatus;

  @Prop({ type: [InvoiceLineSchema], default: [] })
  lines!: InvoiceLine[];

  @Prop({ type: InvoiceAmountsSchema, required: true })
  amounts!: InvoiceAmounts;

  @Prop({ type: InvoicePartySchema, default: () => ({}) })
  party!: InvoiceParty;

  @Prop({ type: Date, required: true, index: true })
  issuedAt!: Date;

  @Prop()
  voidedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ 'party.payerUserId': 1, issuedAt: -1 });
InvoiceSchema.index({ 'party.clubId': 1, issuedAt: -1 });
