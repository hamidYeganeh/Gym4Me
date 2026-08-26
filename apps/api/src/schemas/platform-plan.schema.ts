import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../common/enums';

export type PlatformPlanDocument = HydratedDocument<PlatformPlan>;

export const PLATFORM_ENTITLEMENT_KEYS = [
  'clubs.active',
  'staff.active_per_club',
  'members.active_per_club',
  'monthly_messages.transactional',
  'students.active',
] as const;
export type PlatformEntitlementKey = (typeof PLATFORM_ENTITLEMENT_KEYS)[number];
export type PlatformEntitlementAudience = 'club_owner' | 'coach';
export type PlatformEntitlementLimitMode = 'hard' | 'soft';

@Schema({ _id: false })
export class PlatformEntitlementLimit {
  @Prop({ type: String, enum: PLATFORM_ENTITLEMENT_KEYS, required: true })
  key!: PlatformEntitlementKey;

  @Prop({ type: Number, min: 0, default: null })
  value!: number | null;

  @Prop({ type: String, enum: ['hard', 'soft'], required: true })
  mode!: PlatformEntitlementLimitMode;
}

const PlatformEntitlementLimitSchema = SchemaFactory.createForClass(
  PlatformEntitlementLimit,
);

@Schema({ _id: false })
export class PlatformEntitlementContract {
  @Prop({ type: Number, enum: [1], required: true })
  schemaVersion!: 1;

  @Prop({ type: String, enum: ['club_owner', 'coach'], required: true })
  audience!: PlatformEntitlementAudience;

  @Prop({ type: [String], default: [] })
  capabilities!: string[];

  @Prop({ type: [PlatformEntitlementLimitSchema], default: [] })
  limits!: PlatformEntitlementLimit[];

  @Prop({ type: Number, min: 0, max: 30, default: 7 })
  graceDays!: number;
}

export const PlatformEntitlementContractSchema = SchemaFactory.createForClass(
  PlatformEntitlementContract,
);

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

  @Prop({ type: PlatformEntitlementContractSchema })
  entitlementContract?: PlatformEntitlementContract;

  @Prop({ type: Number, min: 1, default: 1 })
  planVersion!: number;

  @Prop({ type: Boolean, default: false, index: true })
  contractReady!: boolean;

  @Prop({ type: String, enum: ['free_plan', 'read_only'] })
  postExpirationMode?: 'free_plan' | 'read_only';

  @Prop({ type: Types.ObjectId, ref: 'PlatformPlan' })
  fallbackPlanId?: Types.ObjectId;

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
