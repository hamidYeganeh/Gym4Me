import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MetricAggregation,
  MetricPeriodKind,
  MetricPrivacyClass,
  MetricTypeStatus,
  MetricValueKind,
} from '../common/enums';

export type MetricTypeDocument = HydratedDocument<MetricType>;

@Schema({ _id: false })
export class MetricTypeValidation {
  @Prop()
  min?: number;

  @Prop()
  max?: number;

  @Prop()
  step?: number;

  @Prop()
  integer?: boolean;
}

export const MetricTypeValidationSchema =
  SchemaFactory.createForClass(MetricTypeValidation);

/**
 * Admin-managed metric catalog (H6). ProgressMetric.metricKey references
 * MetricType.key; free-form keys remain allowed for custom entries.
 *
 * `unit` is the canonical storage unit; `canonicalUnit` mirrors it when set
 * (alias for clients that prefer the explicit name).
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

  /** Canonical storage unit (ml, kg, min, …). */
  @Prop({ trim: true, maxlength: 40 })
  unit?: string;

  /** Explicit alias of `unit` when clients want the architecture field name. */
  @Prop({ trim: true, maxlength: 40 })
  canonicalUnit?: string;

  @Prop({ type: MetricTypeValidationSchema })
  validation?: MetricTypeValidation;

  @Prop({
    type: String,
    enum: MetricAggregation,
    default: MetricAggregation.LATEST,
  })
  aggregation!: MetricAggregation;

  @Prop({
    type: String,
    enum: MetricPeriodKind,
    default: MetricPeriodKind.POINT,
  })
  periodKind!: MetricPeriodKind;

  @Prop({
    type: String,
    enum: MetricPrivacyClass,
    default: MetricPrivacyClass.WELLNESS,
  })
  privacyClass!: MetricPrivacyClass;

  /** Optional Apple Health / Health Connect type id mappings. */
  @Prop({ type: Object })
  sourceMappings?: Record<string, string>;

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
