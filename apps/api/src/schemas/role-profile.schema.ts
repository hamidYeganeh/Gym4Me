import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../common/enums';
import { User } from './user.schema';

export type RoleProfileDocument = HydratedDocument<RoleProfile>;

/**
 * One document per (user, role). Lazily created on first access so a user
 * who just gained a role immediately has a profile to fill in.
 * Role-specific fields live side by side; only the relevant ones are used.
 */
@Schema({ timestamps: true, collection: 'role_profiles' })
export class RoleProfile {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: Role, required: true })
  role!: Role;

  @Prop({ trim: true })
  bio?: string;

  // athlete
  @Prop() heightCm?: number;
  @Prop() weightKg?: number;

  // coach
  @Prop() yearsExperience?: number;
  @Prop({ default: false }) isVerifiedCoach?: boolean;

  // club_owner
  @Prop({ trim: true }) businessName?: string;

  // club_staff
  @Prop({ trim: true }) position?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RoleProfileSchema = SchemaFactory.createForClass(RoleProfile);

RoleProfileSchema.index({ userId: 1, role: 1 }, { unique: true });
