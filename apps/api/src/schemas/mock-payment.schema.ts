import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MockPaymentOutcomeRule, MockPaymentStatus } from '../common/enums';

export type MockPaymentDocument = HydratedDocument<MockPayment>;

/**
 * Dev-only state for the mock payment gateway.
 * Simulates the Zarinpal create → StartPay → callback → verify lifecycle.
 */
@Schema({ timestamps: true, collection: 'mock_payments' })
export class MockPayment {
  @Prop({ required: true, trim: true, unique: true })
  authority!: string;

  @Prop({ required: true, trim: true, index: true })
  orderId!: string;

  /** Rials (smallest unit). */
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, trim: true })
  callbackUrl!: string;

  @Prop({
    type: String,
    enum: MockPaymentStatus,
    default: MockPaymentStatus.CREATED,
    index: true,
  })
  status!: MockPaymentStatus;

  /** Deterministic forced outcome derived from the amount (for automated tests). */
  @Prop({
    type: String,
    enum: MockPaymentOutcomeRule,
    default: MockPaymentOutcomeRule.INTERACTIVE,
  })
  outcomeRule!: MockPaymentOutcomeRule;

  /** Set on first successful verify; reused for repeated verifies (code 101 semantics). */
  @Prop({ trim: true })
  refId?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MockPaymentSchema = SchemaFactory.createForClass(MockPayment);
