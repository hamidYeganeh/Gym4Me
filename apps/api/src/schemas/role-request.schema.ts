import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role, VerificationStatus } from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type RoleRequestDocument = HydratedDocument<RoleRequest>;

/** Self-service role applications: coach | club_owner (S1). */
export const ROLE_REQUEST_ROLES: Role[] = [Role.COACH, Role.CLUB_OWNER];

@Schema({ _id: false })
export class RoleRequestApplication {
  @Prop({ trim: true })
  bio?: string;

  @Prop({ trim: true })
  headline?: string;

  @Prop()
  yearsExperience?: number;

  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  documentMediaIds!: Types.ObjectId[];

  @Prop({ trim: true })
  note?: string;
}

export const RoleRequestApplicationSchema = SchemaFactory.createForClass(
  RoleRequestApplication,
);

@Schema({ _id: false })
export class RoleRequestReview {
  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  /** Reject reason (required on reject). */
  @Prop({ trim: true })
  reason?: string;
}

export const RoleRequestReviewSchema =
  SchemaFactory.createForClass(RoleRequestReview);

@Schema({ timestamps: true, collection: 'role_requests' })
export class RoleRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ROLE_REQUEST_ROLES, required: true })
  role!: Role;

  @Prop({
    type: String,
    enum: VerificationStatus,
    default: VerificationStatus.UNSUBMITTED,
    index: true,
  })
  status!: VerificationStatus;

  @Prop({ type: RoleRequestApplicationSchema, default: () => ({}) })
  application!: RoleRequestApplication;

  @Prop({ type: RoleRequestReviewSchema, default: () => ({}) })
  review!: RoleRequestReview;

  @Prop()
  submittedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RoleRequestSchema = SchemaFactory.createForClass(RoleRequest);

RoleRequestSchema.index({ userId: 1, role: 1 }, { unique: true });
RoleRequestSchema.index({ status: 1, submittedAt: -1 });
