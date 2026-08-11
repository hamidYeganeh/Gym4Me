import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy, WorkoutPlanStatus } from '../common/enums';
import { Exercise } from './exercise.schema';
import { User } from './user.schema';
import { WorkoutProgram } from './workout-program.schema';

export type WorkoutPlanDocument = HydratedDocument<WorkoutPlan>;

@Schema({ _id: false })
export class WorkoutPlanExerciseItem {
  @Prop({ type: Types.ObjectId, ref: Exercise.name, required: true })
  exerciseId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  sets!: number;

  @Prop({ min: 0 })
  reps?: number;

  @Prop({ min: 0 })
  durationSec?: number;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;
}

export const WorkoutPlanExerciseItemSchema = SchemaFactory.createForClass(
  WorkoutPlanExerciseItem,
);

@Schema({ _id: false })
export class WorkoutPlanDay {
  @Prop({ required: true, min: 0 })
  dayIndex!: number;

  @Prop({ type: [WorkoutPlanExerciseItemSchema], default: [] })
  exercises!: WorkoutPlanExerciseItem[];
}

export const WorkoutPlanDaySchema =
  SchemaFactory.createForClass(WorkoutPlanDay);

@Schema({ _id: false })
export class WorkoutPlanWeek {
  @Prop({ required: true, min: 0 })
  weekIndex!: number;

  @Prop({ type: [WorkoutPlanDaySchema], default: [] })
  days!: WorkoutPlanDay[];
}

export const WorkoutPlanWeekSchema =
  SchemaFactory.createForClass(WorkoutPlanWeek);

@Schema({ _id: false })
export class WorkoutPlanPeriod {
  @Prop({ type: Date })
  start?: Date;

  @Prop({ type: Date })
  end?: Date;
}

export const WorkoutPlanPeriodSchema =
  SchemaFactory.createForClass(WorkoutPlanPeriod);

@Schema({ timestamps: true, collection: 'workout_plans' })
export class WorkoutPlan {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachUserId?: Types.ObjectId;

  /** Optional source template when assigned from a WorkoutProgram. */
  @Prop({ type: Types.ObjectId, ref: WorkoutProgram.name, index: true })
  programId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    type: String,
    enum: WorkoutPlanStatus,
    default: WorkoutPlanStatus.DRAFT,
    index: true,
  })
  status!: WorkoutPlanStatus;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
    index: true,
  })
  privacy!: Privacy;

  @Prop({ type: [WorkoutPlanWeekSchema], default: [] })
  weeks!: WorkoutPlanWeek[];

  @Prop({ type: WorkoutPlanPeriodSchema })
  period?: WorkoutPlanPeriod;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkoutPlanSchema = SchemaFactory.createForClass(WorkoutPlan);

WorkoutPlanSchema.index({ athleteUserId: 1, status: 1, updatedAt: -1 });
