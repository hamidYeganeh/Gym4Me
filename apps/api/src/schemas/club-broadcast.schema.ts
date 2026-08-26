import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ClubBroadcastDocument = HydratedDocument<ClubBroadcast>;

export enum ClubBroadcastAudience {
  ALL = 'all',
  ACTIVE_MEMBERS = 'active_members',
  AT_RISK = 'at_risk',
}

export enum ClubBroadcastStatus {
  QUEUED = 'queued',
}

@Schema({ timestamps: true, collection: 'club_broadcasts' })
export class ClubBroadcast {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  body!: string;

  @Prop({ type: String, enum: ClubBroadcastAudience, required: true })
  audience!: ClubBroadcastAudience;

  @Prop({ type: String, enum: ClubBroadcastStatus, required: true })
  status!: ClubBroadcastStatus;

  @Prop({ required: true, min: 0 })
  recipientCount!: number;

  @Prop({ required: true, trim: true, maxlength: 200 })
  idempotencyKey!: string;

  @Prop({ required: true, trim: true, length: 64 })
  mutationFingerprint!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubBroadcastSchema = SchemaFactory.createForClass(ClubBroadcast);

ClubBroadcastSchema.index({ clubId: 1, createdAt: -1 });
ClubBroadcastSchema.index({ clubId: 1, idempotencyKey: 1 }, { unique: true });
