import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MetricSource, Privacy } from '../common/enums';
import { User } from './user.schema';

export type ProgressMetricDocument = HydratedDocument<ProgressMetric>;

@Schema({ _id: false })
export class ProgressMetricPeriod {
  @Prop({ type: Date })
  start?: Date;

  @Prop({ type: Date })
  end?: Date;
}

export const ProgressMetricPeriodSchema =
  SchemaFactory.createForClass(ProgressMetricPeriod);

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

  @Prop({
    type: String,
    enum: MetricSource,
    required: true,
    default: MetricSource.MANUAL,
    index: true,
  })
  source!: MetricSource;

  /** Stable identifier supplied by Apple Health / Health Connect / importer. */
  @Prop({ trim: true, maxlength: 160 })
  sourceRecordId?: string;

  /** Offline / retry idempotency key for manual or queued writes. */
  @Prop({ trim: true, maxlength: 120 })
  clientMutationId?: string;

  /** Nested measurement interval (preferred). */
  @Prop({ type: ProgressMetricPeriodSchema })
  period?: ProgressMetricPeriod;

  /**
   * Legacy flat mirrors of period.start / period.end.
   * Kept briefly so older readers keep working; writers should set both.
   */
  @Prop({ type: Date })
  periodStartAt?: Date;

  @Prop({ type: Date })
  periodEndAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProgressMetricSchema =
  SchemaFactory.createForClass(ProgressMetric);

ProgressMetricSchema.index({ athleteUserId: 1, metricKey: 1, recordedAt: -1 });
ProgressMetricSchema.index(
  { athleteUserId: 1, source: 1, sourceRecordId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceRecordId: { $type: 'string' } },
  },
);
ProgressMetricSchema.index(
  { athleteUserId: 1, clientMutationId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: 'string' } },
  },
);
