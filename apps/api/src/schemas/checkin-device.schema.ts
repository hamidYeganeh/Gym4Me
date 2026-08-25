import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CheckinDeviceDocument = HydratedDocument<CheckinDevice>;

/** Vendor-neutral credential for turnstiles, barcode readers and kiosks. */
@Schema({ timestamps: true, collection: 'checkin_devices' })
export class CheckinDevice {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 80, default: 'generic' })
  provider!: string;

  /** SHA-256 only; the raw key is returned once on provision/rotation. */
  @Prop({ required: true, select: false })
  keyHash!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  operatorUserId!: Types.ObjectId;

  @Prop({ enum: ['active', 'revoked'], default: 'active', index: true })
  status!: 'active' | 'revoked';

  /** Incrementing epoch invalidates previously signed offline snapshots. */
  @Prop({ required: true, min: 1, default: 1 })
  credentialVersion!: number;

  @Prop()
  lastSeenAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CheckinDeviceSchema = SchemaFactory.createForClass(CheckinDevice);

CheckinDeviceSchema.index({ clubId: 1, name: 1 }, { unique: true });
