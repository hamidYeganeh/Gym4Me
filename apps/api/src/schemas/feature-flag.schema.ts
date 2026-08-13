import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const APP_PLATFORMS = ['ios', 'android', 'web'] as const;
export const RELEASE_CHANNELS = ['production', 'beta', 'development'] as const;

export type AppPlatform = (typeof APP_PLATFORMS)[number];
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number];
export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;

/**
 * Remote switches only expose code that is already bundled in the installed app.
 * They are not authorization controls and must never replace backend permission checks.
 */
@Schema({ timestamps: true, collection: 'feature_flags' })
export class FeatureFlag {
  @Prop({ required: true, unique: true, trim: true, maxlength: 120 })
  key!: string;

  @Prop({ required: true, default: false, index: true })
  enabled!: boolean;

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

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

FeatureFlagSchema.index({ enabled: 1, key: 1 });

