import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  CoachStudentEngagementLevel,
  CoachStudentStatus,
} from '../common/enums';
import { User } from './user.schema';

export type CoachStudentDocument = HydratedDocument<CoachStudent>;

@Schema({ _id: false })
export class CoachStudentCoaching {
  @Prop({ trim: true, maxlength: 80 })
  goalKey?: string;

  @Prop({ trim: true, maxlength: 80 })
  levelKey?: string;
}

export const CoachStudentCoachingSchema =
  SchemaFactory.createForClass(CoachStudentCoaching);

@Schema({ _id: false })
export class CoachStudentEngagement {
  @Prop({
    type: String,
    enum: CoachStudentEngagementLevel,
    default: CoachStudentEngagementLevel.HEALTHY,
  })
  level!: CoachStudentEngagementLevel;

  /** 0–100 adherence / progress toward current plan. */
  @Prop({ min: 0, max: 100 })
  progressPercent?: number;

  @Prop()
  scoredAt?: Date;

  @Prop()
  lastSessionAt?: Date;
}

export const CoachStudentEngagementSchema = SchemaFactory.createForClass(
  CoachStudentEngagement,
);

/** Active coach ↔ athlete coaching relationship (basis for COACH_ONLY privacy). */
@Schema({ timestamps: true, collection: 'coach_students' })
export class CoachStudent {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: CoachStudentStatus,
    default: CoachStudentStatus.ACTIVE,
    index: true,
  })
  status!: CoachStudentStatus;

  @Prop({ type: CoachStudentCoachingSchema, default: () => ({}) })
  coaching!: CoachStudentCoaching;

  @Prop({
    type: CoachStudentEngagementSchema,
    default: () => ({ level: CoachStudentEngagementLevel.HEALTHY }),
  })
  engagement!: CoachStudentEngagement;

  @Prop({ trim: true, maxlength: 4000 })
  notes?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachStudentSchema = SchemaFactory.createForClass(CoachStudent);

CoachStudentSchema.index(
  { coachUserId: 1, athleteUserId: 1 },
  { unique: true },
);
CoachStudentSchema.index({ athleteUserId: 1, status: 1 });
CoachStudentSchema.index({ coachUserId: 1, 'engagement.level': 1 });
