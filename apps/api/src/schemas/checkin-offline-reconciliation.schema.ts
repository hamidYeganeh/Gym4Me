import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CheckInMethod } from '../common/enums';

export type CheckinOfflineReconciliationDocument =
  HydratedDocument<CheckinOfflineReconciliation>;

export enum CheckinOfflineReconciliationStatus {
  PROCESSING = 'processing',
  ACCEPTED = 'accepted',
  REVIEW = 'review',
  REJECTED = 'rejected',
  DISMISSED = 'dismissed',
}

export enum CheckinOfflineResolutionAction {
  RETRY = 'retry',
  DISMISS = 'dismiss',
}

@Schema({ _id: false })
export class CheckinOfflineResolutionClaim {
  @Prop({ required: true, trim: true, minlength: 16, maxlength: 120 })
  clientMutationId!: string;

  @Prop({ type: String, enum: CheckinOfflineResolutionAction, required: true })
  action!: CheckinOfflineResolutionAction;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 500 })
  reason!: string;

  @Prop({ required: true })
  claimedAt!: Date;
}

const CheckinOfflineResolutionClaimSchema = SchemaFactory.createForClass(
  CheckinOfflineResolutionClaim,
);

@Schema({ _id: false })
export class CheckinOfflineResolutionResult {
  @Prop({ required: true, trim: true, minlength: 16, maxlength: 120 })
  clientMutationId!: string;

  @Prop({ type: String, enum: CheckinOfflineResolutionAction, required: true })
  action!: CheckinOfflineResolutionAction;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 500 })
  reason!: string;

  @Prop({
    type: String,
    enum: ['accepted', 'review', 'dismissed'],
    required: true,
  })
  outcome!: 'accepted' | 'review' | 'dismissed';

  @Prop({ required: true })
  resolvedAt!: Date;
}

const CheckinOfflineResolutionResultSchema = SchemaFactory.createForClass(
  CheckinOfflineResolutionResult,
);

@Schema({ _id: false })
export class CheckinOfflineEventPayload {
  @Prop({ required: true, trim: true, maxlength: 120 })
  clientIdempotencyKey!: string;

  @Prop({ type: String, enum: CheckInMethod, required: true })
  method!: CheckInMethod;

  @Prop({ required: true })
  occurredAt!: Date;

  @Prop({ trim: true, maxlength: 40 })
  bookingCode?: string;

  @Prop({ type: Types.ObjectId })
  membershipId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  userId?: Types.ObjectId;
}

const CheckinOfflineEventPayloadSchema = SchemaFactory.createForClass(
  CheckinOfflineEventPayload,
);

@Schema({ timestamps: true, collection: 'checkin_offline_reconciliations' })
export class CheckinOfflineReconciliation {
  @Prop({ type: Types.ObjectId, ref: 'CheckinOfflineSnapshot', required: true })
  snapshotId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CheckinDevice',
    required: true,
    index: true,
  })
  deviceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actorId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  sequence!: number;

  @Prop({ required: true, trim: true, minlength: 16, maxlength: 120 })
  nonce!: string;

  @Prop({ required: true, trim: true, minlength: 64, maxlength: 64 })
  fingerprint!: string;

  @Prop({ type: CheckinOfflineEventPayloadSchema, required: true })
  payload!: CheckinOfflineEventPayload;

  @Prop({
    type: String,
    enum: CheckinOfflineReconciliationStatus,
    default: CheckinOfflineReconciliationStatus.PROCESSING,
    index: true,
  })
  status!: CheckinOfflineReconciliationStatus;

  @Prop({ type: Types.ObjectId, ref: 'CheckIn' })
  checkInId?: Types.ObjectId;

  @Prop({ trim: true, maxlength: 1000 })
  reason?: string;

  /** Stable client-facing category; `reason` remains diagnostic detail. */
  @Prop({ trim: true, maxlength: 80 })
  reasonCode?: string;

  @Prop()
  reconciledAt?: Date;

  @Prop({ type: CheckinOfflineResolutionClaimSchema })
  resolutionClaim?: CheckinOfflineResolutionClaim;

  @Prop({ type: CheckinOfflineResolutionResultSchema })
  lastResolution?: CheckinOfflineResolutionResult;

  /** Append-only resolution decisions; capped by service policy. */
  @Prop({ type: [CheckinOfflineResolutionResultSchema], default: [] })
  resolutions!: CheckinOfflineResolutionResult[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const CheckinOfflineReconciliationSchema = SchemaFactory.createForClass(
  CheckinOfflineReconciliation,
);

CheckinOfflineReconciliationSchema.index(
  { snapshotId: 1, sequence: 1 },
  { unique: true },
);
CheckinOfflineReconciliationSchema.index(
  { snapshotId: 1, nonce: 1 },
  { unique: true },
);
CheckinOfflineReconciliationSchema.index({
  clubId: 1,
  status: 1,
  createdAt: -1,
});
