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

  @Prop({ min: 0 })
  durationSec?: number;

  @Prop({ min: 0 })
  distanceM?: number;

  /** Rate of perceived exertion 1–10. */
  @Prop({ min: 1, max: 10 })
  rpe?: number;
}

export const WorkoutLogSetSchema = SchemaFactory.createForClass(WorkoutLogSet);

@Schema({ _id: false })
export class WorkoutLogTiming {
  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ min: 0 })
  durationSec?: number;
}

export const WorkoutLogTimingSchema =
  SchemaFactory.createForClass(WorkoutLogTiming);

@Schema({ _id: false })
export class WorkoutLogPain {
  @Prop({ min: 0, max: 10 })
  score?: number;

  @Prop({ type: [String], default: [] })
  bodyAreaKeys?: string[];
}

export const WorkoutLogPainSchema =
  SchemaFactory.createForClass(WorkoutLogPain);

@Schema({ timestamps: true, collection: 'workout_logs' })
export class WorkoutLog {
  @Prop({
    type: Types.ObjectId,
    ref: WorkoutPlan.name,
    required: true,
    index: true,
  })
  planId!: Types.ObjectId;

  /** Snapshot of plan revision at log time (opaque ObjectId or revision doc). */
  @Prop({ type: Types.ObjectId })
  planRevisionId?: Types.ObjectId;

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
    default: WorkoutLogStatus.DRAFT,
    index: true,
  })
  status!: WorkoutLogStatus;

  @Prop({ type: WorkoutLogTimingSchema })
  timing?: WorkoutLogTiming;

  @Prop({ trim: true, maxlength: 2000 })
  note?: string;

  @Prop({ type: WorkoutLogPainSchema })
  pain?: WorkoutLogPain;

  @Prop({ trim: true, maxlength: 120 })
  clientMutationId?: string;

  @Prop({ type: Date, required: true, index: true })
  loggedAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkoutLogSchema = SchemaFactory.createForClass(WorkoutLog);

WorkoutLogSchema.index({ athleteId: 1, loggedAt: -1 });
WorkoutLogSchema.index({ planId: 1, sessionIndex: 1 });
WorkoutLogSchema.index(
  { athleteId: 1, clientMutationId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: 'string' } },
  },
);
