import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { APP_PLATFORMS, RELEASE_CHANNELS } from './feature-flag.schema';
import type { AppPlatform, ReleaseChannel } from './feature-flag.schema';

export type MobileReleasePolicyDocument = HydratedDocument<MobileReleasePolicy>;

@Schema({ timestamps: true, collection: 'mobile_release_policies' })
export class MobileReleasePolicy {
  @Prop({ type: String, enum: APP_PLATFORMS, required: true })
  platform!: AppPlatform;

  @Prop({ type: String, enum: RELEASE_CHANNELS, required: true })
  channel!: ReleaseChannel;

  @Prop({ required: true, trim: true, maxlength: 40 })
  latestAppVersion!: string;

  @Prop({ required: true, trim: true, maxlength: 40 })
  minimumSupportedAppVersion!: string;

  @Prop({ required: true, trim: true, maxlength: 12, default: '1' })
  recommendedApiVersion!: string;

  @Prop({ trim: true, maxlength: 500 })
  updateUrl?: string;

  @Prop({ required: true, default: true, index: true })
  enabled!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MobileReleasePolicySchema =
  SchemaFactory.createForClass(MobileReleasePolicy);

MobileReleasePolicySchema.index({ platform: 1, channel: 1 }, { unique: true });
