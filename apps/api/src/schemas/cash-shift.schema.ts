import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CashShiftStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CashShiftDocument = HydratedDocument<CashShift>;

/** Channel totals in Tomans (cash desk / POS / card-to-card / other). */
@Schema({ _id: false })
export class CashShiftTotals {
  @Prop({ required: true, min: 0, default: 0 })
  cash!: number;

  @Prop({ required: true, min: 0, default: 0 })
  pos!: number;

  @Prop({ required: true, min: 0, default: 0 })
  cardToCard!: number;

  @Prop({ required: true, min: 0, default: 0 })
  other!: number;
}

export const CashShiftTotalsSchema =
  SchemaFactory.createForClass(CashShiftTotals);

@Schema({ timestamps: true, collection: 'cash_shifts' })
export class CashShift {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  openedBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  closedBy?: Types.ObjectId;

  @Prop({
    type: String,
    enum: CashShiftStatus,
    required: true,
    default: CashShiftStatus.OPEN,
    index: true,
  })
  status!: CashShiftStatus;

  @Prop({ required: true })
  openedAt!: Date;

  @Prop()
  closedAt?: Date;

  /** Physical count entered by the operator at close. */
  @Prop({ type: CashShiftTotalsSchema })
  counted?: CashShiftTotals;

  /** Expected totals derived from ledger during the shift window. */
  @Prop({ type: CashShiftTotalsSchema })
  expected?: CashShiftTotals;

  @Prop({ trim: true })
  varianceNote?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CashShiftSchema = SchemaFactory.createForClass(CashShift);

CashShiftSchema.index(
  { clubId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: CashShiftStatus.OPEN },
  },
);
