import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityStatus } from '../common/enums';

export type PlatformPlanDocument = HydratedDocument<PlatformPlan>;

@Schema({ _id: false })
export class PlatformPlanPricing {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ min: 0 })
  tax?: number;

  @Prop({ default: 'IRT', trim: true })
  currency!: string;

  /** Billing period length in days (e.g. 30). */
  @Prop({ min: 1, default: 30 })
  periodDays!: number;
}

export const PlatformPlanPricingSchema =
  SchemaFactory.createForClass(PlatformPlanPricing);

/** Gym4Me SaaS plan catalog (separate from club memberships). */
@Schema({ timestamps: true, collection: 'platform_plans' })
export class PlatformPlan {
  @Prop({ required: true, unique: true, trim: true, maxlength: 64 })
  code!: string;

  @Prop({ required: true, trim: true, maxlength: 200 })
  name!: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: PlatformPlanPricingSchema, required: true })
  pricing!: PlatformPlanPricing;

  @Prop({ type: [String], default: [] })
  features!: string[];

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformPlanSchema = SchemaFactory.createForClass(PlatformPlan);

PlatformPlanSchema.index({ status: 1, code: 1 });
