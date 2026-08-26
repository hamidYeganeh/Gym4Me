import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Club } from './club.schema';
import { User } from './user.schema';

export type ClubInventoryItemDocument = HydratedDocument<ClubInventoryItem>;

export enum ClubInventoryCondition {
  GOOD = 'good',
  NEEDS_REPAIR = 'needs_repair',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum ClubInventoryStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, collection: 'club_inventory_items' })
export class ClubInventoryItem {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 160 })
  name!: string;

  @Prop({ required: true, min: 0, max: 100_000 })
  quantity!: number;

  @Prop({ trim: true, maxlength: 160 })
  locationLabel?: string;

  @Prop({
    type: String,
    enum: ClubInventoryCondition,
    default: ClubInventoryCondition.GOOD,
    index: true,
  })
  condition!: ClubInventoryCondition;

  @Prop({ type: Date })
  nextServiceAt?: Date;

  @Prop({ trim: true, maxlength: 1000 })
  maintenanceNote?: string;

  @Prop({
    type: String,
    enum: ClubInventoryStatus,
    default: ClubInventoryStatus.ACTIVE,
    index: true,
  })
  status!: ClubInventoryStatus;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  updatedBy!: Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  version!: number;

  @Prop({ required: true, trim: true, maxlength: 120 })
  createIdempotencyKey!: string;

  @Prop({ required: true, trim: true, length: 64 })
  createFingerprint!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubInventoryItemSchema =
  SchemaFactory.createForClass(ClubInventoryItem);

ClubInventoryItemSchema.index({ clubId: 1, status: 1, updatedAt: -1 });
ClubInventoryItemSchema.index(
  { clubId: 1, createIdempotencyKey: 1 },
  { unique: true },
);
