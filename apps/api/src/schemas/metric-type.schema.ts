import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MetricTypeStatus, MetricValueKind } from '../common/enums';

export type MetricTypeDocument = HydratedDocument<MetricType>;

/**
 * Admin-managed metric catalog (H6). ProgressMetric.metricKey references
 * MetricType.key; free-form keys remain allowed for custom entries.
 */
@Schema({ timestamps: true, collection: 'metric_types' })
export class MetricType {
  /** Stable key, e.g. weight_kg, heart_rate, hydration. */
  @Prop({ required: true, unique: true, trim: true, maxlength: 80 })
  key!: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ type: String, enum: MetricValueKind, required: true })
  valueKind!: MetricValueKind;

  @Prop({ trim: true, maxlength: 40 })
  unit?: string;

  /** Sport taxonomy id/slug; absent = global. */
  @Prop({ trim: true, maxlength: 80, index: true })
  sportId?: string;

  @Prop({
    type: String,
    enum: MetricTypeStatus,
    default: MetricTypeStatus.ACTIVE,
    index: true,
  })
  status!: MetricTypeStatus;

  /** Default dashboard sort among active types. */
  @Prop({ required: true, default: 100, min: 0 })
  sortHint!: number;

  /** Chart hint for mobile dashboard cards. */
  @Prop({ trim: true, maxlength: 40 })
  chartKind?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MetricTypeSchema = SchemaFactory.createForClass(MetricType);

MetricTypeSchema.index({ status: 1, sortHint: 1 });
