import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Privacy,
  WorkoutProgramOwnerType,
  WorkoutProgramStatus,
} from '../common/enums';
import { User } from './user.schema';
import { WorkoutPlanWeek, WorkoutPlanWeekSchema } from './workout-plan.schema';

export type WorkoutProgramDocument = HydratedDocument<WorkoutProgram>;

@Schema({ _id: false })
export class WorkoutProgramOwner {
  @Prop({ type: String, enum: WorkoutProgramOwnerType, required: true })
  type!: WorkoutProgramOwnerType;

  @Prop({ type: Types.ObjectId, ref: User.name })
  id?: Types.ObjectId;
}

export const WorkoutProgramOwnerSchema =
  SchemaFactory.createForClass(WorkoutProgramOwner);

@Schema({ _id: false })
export class WorkoutProgramMeta {
  @Prop({ trim: true, maxlength: 120 })
  focusLabel?: string;

  @Prop({ min: 1 })
  weekCount?: number;

  @Prop({ min: 1 })
  sessionsPerWeek?: number;
}

export const WorkoutProgramMetaSchema =
  SchemaFactory.createForClass(WorkoutProgramMeta);

/**
 * Reusable workout program template. Assigning to an athlete creates a
 * WorkoutPlan instance — do not store athleteUserId here.
 */
@Schema({ timestamps: true, collection: 'workout_programs' })
export class WorkoutProgram {
  @Prop({ type: WorkoutProgramOwnerSchema, required: true })
  owner!: WorkoutProgramOwner;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    type: String,
    enum: WorkoutProgramStatus,
    default: WorkoutProgramStatus.DRAFT,
    index: true,
  })
  status!: WorkoutProgramStatus;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
  })
  privacy!: Privacy;

  @Prop({ type: WorkoutProgramMetaSchema, default: () => ({}) })
  meta!: WorkoutProgramMeta;

  @Prop({ type: [WorkoutPlanWeekSchema], default: [] })
  weeks!: WorkoutPlanWeek[];

  /** Cached count of active assignments (WorkoutPlan with this template). */
  @Prop({ required: true, default: 0, min: 0 })
  assignedCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkoutProgramSchema =
  SchemaFactory.createForClass(WorkoutProgram);

WorkoutProgramSchema.index({ 'owner.type': 1, 'owner.id': 1, status: 1 });
