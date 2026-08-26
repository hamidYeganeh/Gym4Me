import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PLATFORM_ENTITLEMENT_KEYS } from './platform-plan.schema';
import type { PlatformEntitlementKey } from './platform-plan.schema';

export type PlatformEntitlementUsageDocument =
  HydratedDocument<PlatformEntitlementUsage>;

/** Immutable, idempotent usage fact consumed by subscription limit projectors. */
@Schema({ timestamps: true, collection: 'platform_entitlement_usage' })
export class PlatformEntitlementUsage {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: String, enum: PLATFORM_ENTITLEMENT_KEYS, required: true })
  key!: PlatformEntitlementKey;

  /** Tehran calendar month, e.g. `2026-08`; intentionally Gregorian transport. */
  @Prop({ required: true, match: /^\d{4}-\d{2}$/ })
  bucket!: string;

  @Prop({ required: true, min: 1 })
  amount!: number;

  @Prop({ required: true, trim: true })
  sourceId!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformEntitlementUsageSchema = SchemaFactory.createForClass(
  PlatformEntitlementUsage,
);

PlatformEntitlementUsageSchema.index(
  { ownerUserId: 1, clubId: 1, key: 1, bucket: 1, sourceId: 1 },
  { unique: true },
);
PlatformEntitlementUsageSchema.index({
  ownerUserId: 1,
  clubId: 1,
  key: 1,
  bucket: 1,
});
