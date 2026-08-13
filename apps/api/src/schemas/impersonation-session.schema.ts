import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ImpersonationSessionStatus } from '../common/enums';
import { User } from './user.schema';

export type ImpersonationSessionDocument =
  HydratedDocument<ImpersonationSession>;

/**
 * Admin impersonation audit trail.
 *
 * Full JWT claim attachment (`impersonationSessionId` / limited scope) can be
 * wired later in AuthService — this schema stores the session + required
 * reason so admin start/end works independently.
 */
@Schema({ timestamps: true, collection: 'impersonation_sessions' })
export class ImpersonationSession {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  adminId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  targetUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  reason!: string;

  @Prop({
    type: String,
    enum: ImpersonationSessionStatus,
    default: ImpersonationSessionStatus.ACTIVE,
    index: true,
  })
  status!: ImpersonationSessionStatus;

  @Prop({ type: Date, required: true })
  startedAt!: Date;

  @Prop()
  endedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ImpersonationSessionSchema =
  SchemaFactory.createForClass(ImpersonationSession);

ImpersonationSessionSchema.index({ adminId: 1, status: 1, startedAt: -1 });
ImpersonationSessionSchema.index({ targetUserId: 1, startedAt: -1 });
