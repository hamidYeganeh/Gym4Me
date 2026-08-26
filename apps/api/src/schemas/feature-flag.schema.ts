import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const APP_PLATFORMS = ['ios', 'android', 'web'] as const;
export const RELEASE_CHANNELS = ['production', 'beta', 'development'] as const;
export const FEATURE_FLAG_STATUSES = [
  'draft',
  'active',
  'paused',
  'archived',
] as const;

export type AppPlatform = (typeof APP_PLATFORMS)[number];
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number];
export type FeatureFlagStatus = (typeof FEATURE_FLAG_STATUSES)[number];
export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;

@Schema({ _id: false })
export class FeatureFlagRule {
  @Prop({ type: [String], enum: APP_PLATFORMS, required: true })
  platforms!: AppPlatform[];

  @Prop({ type: [String], enum: RELEASE_CHANNELS, required: true })
  channels!: ReleaseChannel[];

  @Prop({ trim: true, maxlength: 40 })
  minAppVersion?: string;

  @Prop({ trim: true, maxlength: 40 })
  maxAppVersion?: string;

  @Prop({ required: true, min: 0, max: 100 })
  rolloutPercentage!: number;

  @Prop({ required: true, trim: true, maxlength: 64 })
  variant!: string;
}

export const FeatureFlagRuleSchema =
  SchemaFactory.createForClass(FeatureFlagRule);

/**
 * Remote switches only expose code that is already bundled in the installed app.
 * They are not authorization controls and must never replace backend permission checks.
 */
@Schema({ timestamps: true, collection: 'feature_flags' })
export class FeatureFlag {
  @Prop({ required: true, unique: true, trim: true, maxlength: 120 })
  key!: string;

  @Prop({
    type: String,
    enum: FEATURE_FLAG_STATUSES,
    required: true,
    default: 'draft',
    index: true,
  })
  status!: FeatureFlagStatus;

  @Prop({ required: true, default: 100, min: 0, max: 100 })
  rolloutPercentage!: number;

  @Prop({ type: [String], enum: APP_PLATFORMS, default: APP_PLATFORMS })
  platforms!: AppPlatform[];

  @Prop({ type: [String], enum: RELEASE_CHANNELS, default: ['production'] })
  channels!: ReleaseChannel[];

  @Prop({ trim: true, maxlength: 40 })
  minimumAppVersion?: string;

  @Prop({ trim: true, maxlength: 40 })
  maximumAppVersion?: string;

  @Prop({ type: [FeatureFlagRuleSchema], default: [] })
  rules!: FeatureFlagRule[];

  @Prop({ trim: true, maxlength: 64 })
  defaultVariant?: string;

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  /** When set, bootstrap stops exposing this flag after the timestamp. */
  @Prop({ type: Date, index: true })
  exposureEndsAt?: Date;

  /** Legacy dual-read only — prefer `status`. */
  enabled?: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

FeatureFlagSchema.index({ status: 1, key: 1 });
