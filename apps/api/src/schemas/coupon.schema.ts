import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../common/enums';

export enum CouponDiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

@Schema({ _id: false })
export class CouponDiscount {
  @Prop({ type: String, enum: CouponDiscountType, required: true })
  type!: CouponDiscountType;

  /** Percent (1–100) or fixed IRT amount depending on `type`. */
  @Prop({ required: true, min: 1 })
  value!: number;

  /** Cap for percent discounts. */
  @Prop({ min: 0 })
  maxAmount?: number;
}

export const CouponDiscountSchema =
  SchemaFactory.createForClass(CouponDiscount);

@Schema({ _id: false })
export class CouponConstraints {
  @Prop()
  validFrom?: Date;

  @Prop()
  validUntil?: Date;

  /** Total redemptions across all users. */
  @Prop({ min: 1 })
  maxRedemptions?: number;

  /** Redemptions per user. */
  @Prop({ min: 1 })
  maxPerUser?: number;

  /** Minimum order amount the coupon applies to. */
  @Prop({ min: 0 })
  minAmount?: number;
}

export const CouponConstraintsSchema =
  SchemaFactory.createForClass(CouponConstraints);

export type CouponDocument = HydratedDocument<Coupon>;

/** Minimal discount engine (SYS): platform-wide or per-club coupon codes. */
@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ trim: true, maxlength: 200 })
  title?: string;

  /** Empty = platform-wide; set = only that club's purchases. */
  @Prop({ type: Types.ObjectId, index: true })
  clubId?: Types.ObjectId;

  @Prop({ type: CouponDiscountSchema, required: true })
  discount!: CouponDiscount;

  @Prop({ type: CouponConstraintsSchema, default: () => ({}) })
  constraints!: CouponConstraints;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  @Prop({ default: 0, min: 0 })
  redemptionCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

export type CouponRedemptionDocument = HydratedDocument<CouponRedemption>;

@Schema({ timestamps: true, collection: 'coupon_redemptions' })
export class CouponRedemption {
  @Prop({ type: Types.ObjectId, ref: Coupon.name, required: true, index: true })
  couponId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, index: true })
  userId?: Types.ObjectId;

  /** Idempotency anchor, e.g. `membership:<id>` — one redemption per order. */
  @Prop({ required: true, unique: true, trim: true })
  contextKey!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, min: 0 })
  discount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CouponRedemptionSchema =
  SchemaFactory.createForClass(CouponRedemption);

CouponRedemptionSchema.index({ couponId: 1, userId: 1 });

export type CouponUserUsageDocument = HydratedDocument<CouponUserUsage>;

/** Atomic per-user counter for coupons allowing more than one redemption. */
@Schema({ timestamps: true, collection: 'coupon_user_usage' })
export class CouponUserUsage {
  @Prop({ type: Types.ObjectId, ref: Coupon.name, required: true })
  couponId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 0, default: 0 })
  count!: number;
}

export const CouponUserUsageSchema =
  SchemaFactory.createForClass(CouponUserUsage);

CouponUserUsageSchema.index({ couponId: 1, userId: 1 }, { unique: true });
