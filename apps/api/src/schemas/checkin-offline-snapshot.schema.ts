import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CheckinOfflineSnapshotDocument =
  HydratedDocument<CheckinOfflineSnapshot>;

export enum CheckinOfflineSnapshotStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

@Schema({ _id: false })
export class OfflineBookingEligibility {
  @Prop({ type: Types.ObjectId, required: true })
  bookingId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 40 })
  code!: string;

  @Prop({ required: true })
  validFrom!: Date;

  @Prop({ required: true })
  validUntil!: Date;
}

const OfflineBookingEligibilitySchema = SchemaFactory.createForClass(
  OfflineBookingEligibility,
);

@Schema({ _id: false })
export class OfflineMembershipEligibility {
  @Prop({ type: Types.ObjectId, required: true })
  membershipId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop()
  validUntil?: Date;
}

const OfflineMembershipEligibilitySchema = SchemaFactory.createForClass(
  OfflineMembershipEligibility,
);

@Schema({ timestamps: true, collection: 'checkin_offline_snapshots' })
export class CheckinOfflineSnapshot {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CheckinDevice',
    required: true,
    index: true,
  })
  deviceId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  deviceCredentialVersion!: number;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ type: [OfflineBookingEligibilitySchema], default: [] })
  bookings!: OfflineBookingEligibility[];

  @Prop({ type: [OfflineMembershipEligibilitySchema], default: [] })
  memberships!: OfflineMembershipEligibility[];

  @Prop({ required: true })
  issuedAt!: Date;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ required: true, index: true })
  syncDeadline!: Date;

  @Prop({ required: true, min: 1, max: 100 })
  maxEvents!: number;

  @Prop({ required: true, min: 0, default: 0 })
  lastSequence!: number;

  @Prop({
    type: String,
    enum: CheckinOfflineSnapshotStatus,
    default: CheckinOfflineSnapshotStatus.ACTIVE,
    index: true,
  })
  status!: CheckinOfflineSnapshotStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CheckinOfflineSnapshotSchema = SchemaFactory.createForClass(
  CheckinOfflineSnapshot,
);

CheckinOfflineSnapshotSchema.index({ deviceId: 1, createdAt: -1 });
CheckinOfflineSnapshotSchema.index({ status: 1, syncDeadline: 1 });
