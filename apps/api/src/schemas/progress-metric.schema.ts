import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy } from '../common/enums';
import { User } from './user.schema';

export type ProgressMetricDocument = HydratedDocument<ProgressMetric>;

@Schema({ timestamps: true, collection: 'progress_metrics' })
export class ProgressMetric {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
    index: true,
  })
  privacy!: Privacy;

  /** e.g. weight_kg, body_fat, custom keys. */
  @Prop({ required: true, trim: true, maxlength: 80, index: true })
  metricKey!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ trim: true, maxlength: 40 })
  unit?: string;

  @Prop({ type: Date, required: true, index: true })
  recordedAt!: Date;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProgressMetricSchema =
  SchemaFactory.createForClass(ProgressMetric);

ProgressMetricSchema.index({ athleteUserId: 1, metricKey: 1, recordedAt: -1 });
