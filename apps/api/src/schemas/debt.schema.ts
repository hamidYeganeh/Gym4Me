import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DebtStatus, InstallmentStatus } from '../common/enums';
import { Club } from './club.schema';
import { Payment } from './payment.schema';
import { User } from './user.schema';

export type DebtDocument = HydratedDocument<Debt>;
export type InstallmentDocument = HydratedDocument<Installment>;

@Schema({ _id: false })
export class DebtGuest {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  phone!: string;
}

export const DebtGuestSchema = SchemaFactory.createForClass(DebtGuest);

@Schema({ _id: false })
export class DebtHolder {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;

  @Prop({ type: DebtGuestSchema })
  guest?: DebtGuest;
}

export const DebtHolderSchema = SchemaFactory.createForClass(DebtHolder);

@Schema({ timestamps: true, collection: 'debts' })
export class Debt {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: DebtHolderSchema, required: true })
  holder!: DebtHolder;

  @Prop({
    type: String,
    enum: DebtStatus,
    required: true,
    default: DebtStatus.OPEN,
    index: true,
  })
  status!: DebtStatus;

  /** Original principal in Tomans. */
  @Prop({ required: true, min: 0 })
  principal!: number;

  /** Outstanding remaining balance in Tomans. */
  @Prop({ required: true, min: 0 })
  remaining!: number;

  @Prop({ required: true, index: true })
  dueAt!: Date;

  /** Append-only refs to payments that reduced this debt. */
  @Prop({ type: [{ type: Types.ObjectId, ref: Payment.name }], default: [] })
  paymentIds!: Types.ObjectId[];

  @Prop({ trim: true })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);

DebtSchema.index({ clubId: 1, status: 1, dueAt: 1 });

@Schema({ timestamps: true, collection: 'installments' })
export class Installment {
  @Prop({ type: Types.ObjectId, ref: Debt.name, required: true, index: true })
  debtId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  sequence!: number;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({
    type: String,
    enum: InstallmentStatus,
    required: true,
    default: InstallmentStatus.SCHEDULED,
    index: true,
  })
  status!: InstallmentStatus;

  @Prop({ required: true })
  dueAt!: Date;

  @Prop()
  paidAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const InstallmentSchema = SchemaFactory.createForClass(Installment);

InstallmentSchema.index({ debtId: 1, sequence: 1 }, { unique: true });
