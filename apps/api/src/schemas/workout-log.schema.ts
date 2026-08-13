import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WorkoutLogStatus } from '../common/enums';
import { Exercise } from './exercise.schema';
import { User } from './user.schema';
import { WorkoutPlan } from './workout-plan.schema';

export type WorkoutLogDocument = HydratedDocument<WorkoutLog>;

@Schema({ _id: false })
export class WorkoutLogSet {
  @Prop({ type: Types.ObjectId, ref: Exercise.name, required: true })
  exerciseId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  reps!: number;

  @Prop({ min: 0 })
  weightKg?: number;

  /** Rate of perceived exertion 1–10. */
  @Prop({ min: 1, max: 10 })
  rpe?: number;
}

export const WorkoutLogSetSchema = SchemaFactory.createForClass(WorkoutLogSet);

@Schema({ timestamps: true, collection: 'workout_logs' })
export class WorkoutLog {
  @Prop({
    type: Types.ObjectId,
    ref: WorkoutPlan.name,
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  sessionIndex!: number;

  @Prop({ type: [WorkoutLogSetSchema], default: [] })
  sets!: WorkoutLogSet[];

  @Prop({
    type: String,
    enum: WorkoutLogStatus,
    required: true,
    index: true,
  })
  status!: WorkoutLogStatus;

  @Prop({ type: Date, required: true, index: true })
  loggedAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkoutLogSchema = SchemaFactory.createForClass(WorkoutLog);

WorkoutLogSchema.index({ athleteId: 1, loggedAt: -1 });
WorkoutLogSchema.index({ planId: 1, sessionIndex: 1 });
