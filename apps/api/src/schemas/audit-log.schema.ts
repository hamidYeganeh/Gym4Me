import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditAction } from '../common/enums';
import { User } from './user.schema';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'audit_logs',
})
export class AuditLog {
  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action!: AuditAction;

  /** Who performed the action (null for anonymous, e.g. failed logins). */
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  actorId?: Types.ObjectId;

  /** Who/what the action was performed on. */
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  targetUserId?: Types.ObjectId;

  @Prop() ip?: string;
  @Prop() userAgent?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  createdAt!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ createdAt: -1 });
