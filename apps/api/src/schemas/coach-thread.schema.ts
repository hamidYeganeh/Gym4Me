import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../common/enums';
import { User } from './user.schema';

export type CoachThreadDocument = HydratedDocument<CoachThread>;

/**
 * Direct coach ↔ athlete messaging thread.
 * Scoped 1:1 to an active CoachStudent relationship (enforced in service).
 */
@Schema({ timestamps: true, collection: 'coach_threads' })
export class CoachThread {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  @Prop()
  lastMessageAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachThreadSchema = SchemaFactory.createForClass(CoachThread);

CoachThreadSchema.index({ coachUserId: 1, athleteUserId: 1 }, { unique: true });
