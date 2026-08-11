import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ClubStaffStatus,
  StaffPermissionKey,
  StaffRolePreset,
} from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type ClubStaffDocument = HydratedDocument<ClubStaff>;

@Schema({ timestamps: true, collection: 'club_staff' })
export class ClubStaff {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ClubStaffStatus,
    default: ClubStaffStatus.ACTIVE,
    index: true,
  })
  status!: ClubStaffStatus;

  /** Named preset — grants in `permissions` are still authoritative. */
  @Prop({
    type: String,
    enum: StaffRolePreset,
    default: StaffRolePreset.CUSTOM,
  })
  preset!: StaffRolePreset;

  @Prop({
    type: [String],
    enum: StaffPermissionKey,
    default: [],
  })
  permissions!: StaffPermissionKey[];

  @Prop()
  invitedAt?: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  revokedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubStaffSchema = SchemaFactory.createForClass(ClubStaff);

ClubStaffSchema.index({ clubId: 1, userId: 1 }, { unique: true });
ClubStaffSchema.index({ clubId: 1, status: 1 });
