import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MembershipStatus } from '../common/enums';
import { User } from './user.schema';

export type ClubMembershipDocument = HydratedDocument<ClubMembership>;

/** Desk sale without an app account (OWN-IR-3). */
@Schema({ _id: false })
export class MembershipGuestHolder {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 32 })
  phone!: string;
}

export const MembershipGuestHolderSchema = SchemaFactory.createForClass(
  MembershipGuestHolder,
);

@Schema({ _id: false })
export class MembershipHolder {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  userId?: Types.ObjectId;

  @Prop({ type: MembershipGuestHolderSchema })
  guest?: MembershipGuestHolder;
}

export const MembershipHolderSchema =
  SchemaFactory.createForClass(MembershipHolder);

@Schema({ _id: false })
export class MembershipCredit {
  @Prop({ min: 0 })
  remainingSessions?: number;

  @Prop({ min: 0 })
  remainingEntries?: number;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const MembershipCreditSchema =
  SchemaFactory.createForClass(MembershipCredit);

@Schema({ _id: false })
export class MembershipFreeze {
  @Prop({ type: Date, required: true })
  frozenAt!: Date;

  @Prop({ type: Date })
  unfreezeAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  reason?: string;
}

export const MembershipFreezeSchema =
  SchemaFactory.createForClass(MembershipFreeze);

/** Issued club membership instance (active credit / freeze / holder). */
@Schema({ timestamps: true, collection: 'club_memberships' })
export class ClubMembership {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClubMembershipPlan',
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  @Prop({ type: MembershipHolderSchema, required: true })
  holder!: MembershipHolder;

  @Prop({
    type: String,
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
    index: true,
  })
  status!: MembershipStatus;

  @Prop({ type: MembershipCreditSchema, default: () => ({}) })
  credit!: MembershipCredit;

  @Prop({ type: MembershipFreezeSchema })
  freeze?: MembershipFreeze;

  /** Desk operator / seller user id. */
  @Prop({ type: Types.ObjectId, ref: User.name })
  soldBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  paymentId?: Types.ObjectId;

  /**
   * Client-generated key for a desk sale/import row. It prevents duplicate
   * memberships when a weak connection retries the same request.
   */
  @Prop({ trim: true, maxlength: 200 })
  idempotencyKey?: string;

  /** Optional import metadata for reconciliation with the source CSV. */
  @Prop({
    type: {
      batchKey: { type: String, trim: true, maxlength: 200 },
      rowKey: { type: String, trim: true, maxlength: 200 },
    },
    _id: false,
  })
  importSource?: { batchKey: string; rowKey: string };

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubMembershipSchema =
  SchemaFactory.createForClass(ClubMembership);

ClubMembershipSchema.index({ clubId: 1, status: 1, createdAt: -1 });
ClubMembershipSchema.index({ 'holder.userId': 1, status: 1 });
ClubMembershipSchema.index({ planId: 1, status: 1 });
ClubMembershipSchema.index(
  { clubId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);
