import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../common/enums';
import { CoachThread } from './coach-thread.schema';
import { User } from './user.schema';

export type CoachMessageDocument = HydratedDocument<CoachMessage>;

@Schema({ timestamps: true, collection: 'coach_messages' })
export class CoachMessage {
  @Prop({
    type: Types.ObjectId,
    ref: CoachThread.name,
    required: true,
    index: true,
  })
  threadId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  senderUserId!: Types.ObjectId;

  /** Sender's activeRole at send time (coach | athlete). */
  @Prop({
    type: String,
    enum: [Role.COACH, Role.ATHLETE],
    required: true,
  })
  senderRole!: Role.COACH | Role.ATHLETE;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  body!: string;

  @Prop({ type: Date, required: true, index: true })
  sentAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachMessageSchema = SchemaFactory.createForClass(CoachMessage);

CoachMessageSchema.index({ threadId: 1, sentAt: -1 });
