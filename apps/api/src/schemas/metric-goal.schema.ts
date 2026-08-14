import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  MetricGoalOperator,
  MetricGoalPeriod,
  MetricGoalStatus,
} from '../common/enums';
import { User } from './user.schema';

export type MetricGoalDocument = HydratedDocument<MetricGoal>;

@Schema({ _id: false })
export class MetricGoalTarget {
  @Prop({
    type: String,
    enum: MetricGoalOperator,
    required: true,
    default: MetricGoalOperator.GTE,
  })
  operator!: MetricGoalOperator;

  @Prop({ required: true })
  value!: number;

  @Prop({ trim: true, maxlength: 40 })
  unit?: string;
}

export const MetricGoalTargetSchema =
  SchemaFactory.createForClass(MetricGoalTarget);

@Schema({ _id: false })
export class MetricGoalEffective {
  @Prop({ type: Date, required: true })
  start!: Date;

  @Prop({ type: Date })
  end?: Date;
}

export const MetricGoalEffectiveSchema =
  SchemaFactory.createForClass(MetricGoalEffective);

@Schema({ timestamps: true, collection: 'metric_goals' })
export class MetricGoal {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 80, index: true })
  metricKey!: string;

  @Prop({ type: MetricGoalTargetSchema, required: true })
  target!: MetricGoalTarget;

  @Prop({
    type: String,
    enum: MetricGoalPeriod,
    required: true,
    default: MetricGoalPeriod.DAILY,
  })
  period!: MetricGoalPeriod;

  @Prop({ type: MetricGoalEffectiveSchema, required: true })
  effective!: MetricGoalEffective;

  @Prop({
    type: String,
    enum: MetricGoalStatus,
    default: MetricGoalStatus.ACTIVE,
    index: true,
  })
  status!: MetricGoalStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MetricGoalSchema = SchemaFactory.createForClass(MetricGoal);

MetricGoalSchema.index({ athleteUserId: 1, metricKey: 1, status: 1 });
