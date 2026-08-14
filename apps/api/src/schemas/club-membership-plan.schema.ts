import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  EntityStatus,
  MembershipPlanKind,
  MembershipTransferPolicy,
  PublishStatus,
} from '../common/enums';

export type ClubMembershipPlanDocument = HydratedDocument<ClubMembershipPlan>;

@Schema({ _id: false })
export class MembershipPlanPricing {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ min: 0 })
  tax?: number;

  /** Iranian Toman by default (product money domain). */
  @Prop({ default: 'IRT', trim: true })
  currency!: string;
}

export const MembershipPlanPricingSchema = SchemaFactory.createForClass(
  MembershipPlanPricing,
);

@Schema({ _id: false })
export class MembershipPlanRules {
  @Prop({ min: 0 })
  freezeMaxDays?: number;

  @Prop({
    type: String,
    enum: MembershipTransferPolicy,
    default: MembershipTransferPolicy.FORBIDDEN,
  })
  transferPolicy!: MembershipTransferPolicy;

  @Prop({ min: 0 })
  guestPassCount?: number;
}

export const MembershipPlanRulesSchema =
  SchemaFactory.createForClass(MembershipPlanRules);

/** Sellable club membership catalog row (duration / sessions / entries). */
@Schema({ timestamps: true, collection: 'club_membership_plans' })
export class ClubMembershipPlan {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  name!: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({
    type: String,
    enum: MembershipPlanKind,
    required: true,
    index: true,
  })
  kind!: MembershipPlanKind;

  @Prop({ type: MembershipPlanPricingSchema, required: true })
  pricing!: MembershipPlanPricing;

  @Prop({ type: MembershipPlanRulesSchema, default: () => ({}) })
  rules!: MembershipPlanRules;

  /** Required when `kind === duration`. */
  @Prop({ min: 1 })
  durationDays?: number;

  /** Required when `kind === sessions`. */
  @Prop({ min: 1 })
  sessionsTotal?: number;

  /** Required when `kind === entries`. */
  @Prop({ min: 1 })
  entriesTotal?: number;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  @Prop({
    type: String,
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
    index: true,
  })
  publishStatus?: PublishStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubMembershipPlanSchema =
  SchemaFactory.createForClass(ClubMembershipPlan);

ClubMembershipPlanSchema.index({ clubId: 1, status: 1, publishStatus: 1 });
ClubMembershipPlanSchema.index({ clubId: 1, kind: 1 });
