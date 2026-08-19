import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { APP_PLATFORMS, RELEASE_CHANNELS } from './feature-flag.schema';
import type { AppPlatform, ReleaseChannel } from './feature-flag.schema';

export type MobileReleasePolicyDocument = HydratedDocument<MobileReleasePolicy>;

@Schema({ _id: false })
export class ReleaseNotes {
  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({
    type: [String],
    required: true,
    default: [],
    validate: {
      validator: (value: string[]) =>
        Array.isArray(value) &&
        value.length >= 1 &&
        value.length <= 8 &&
        value.every((item) => typeof item === 'string' && item.trim().length > 0),
      message: 'releaseNotes.features must contain 1–8 non-empty strings',
    },
  })
  features!: string[];
}

export const ReleaseNotesSchema = SchemaFactory.createForClass(ReleaseNotes);

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

  @Prop({ type: ReleaseNotesSchema })
  releaseNotes?: ReleaseNotes;

  @Prop({ required: true, default: true, index: true })
  enabled!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MobileReleasePolicySchema =
  SchemaFactory.createForClass(MobileReleasePolicy);

MobileReleasePolicySchema.index({ platform: 1, channel: 1 }, { unique: true });
