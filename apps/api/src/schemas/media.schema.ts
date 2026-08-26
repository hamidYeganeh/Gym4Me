import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MediaScanStatus, MediaVisibility } from '../common/enums';

export type MediaDocument = HydratedDocument<Media>;

export enum MediaPurpose {
  GENERAL = 'general',
  PROGRESS_PHOTO = 'progress_photo',
  SOCIAL_POST = 'social_post',
  MEAL_ADHERENCE = 'meal_adherence',
}

@Schema({ timestamps: true, collection: 'media' })
export class Media {
  @Prop({ required: true })
  path!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  size!: number;

  /** SHA-256 of file bytes when available. */
  @Prop({ index: true })
  hash?: string;

  @Prop()
  originalName?: string;

  /**
   * public = unauthenticated file/meta reads allowed.
   * private = uploader or admin only.
   * Default public preserves existing gallery/cover URLs.
   */
  @Prop({
    type: String,
    enum: MediaVisibility,
    default: MediaVisibility.PUBLIC,
    index: true,
  })
  visibility!: MediaVisibility;

  /** String ref avoids circular import with user.schema. */
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  uploaderId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: MediaPurpose,
    default: MediaPurpose.GENERAL,
    index: true,
  })
  purpose!: MediaPurpose;

  @Prop({
    type: {
      kind: { type: String, required: true },
      refId: { type: Types.ObjectId, required: true },
      attachedAt: { type: Date, required: true },
    },
    _id: false,
  })
  attachment?: {
    kind: 'progress_photo' | 'social_post' | 'meal_adherence';
    refId: Types.ObjectId;
    attachedAt: Date;
  };

  @Prop({ type: Date, index: true })
  deletingAt?: Date;

  @Prop({
    type: {
      status: {
        type: String,
        enum: MediaScanStatus,
        required: true,
      },
      scannedAt: { type: Date },
      provider: { type: String },
      attempts: { type: Number, default: 0 },
      lastErrorCode: { type: String },
    },
    _id: false,
  })
  scan?: {
    status: MediaScanStatus;
    scannedAt?: Date;
    provider?: string;
    attempts?: number;
    lastErrorCode?: string;
  };

  createdAt!: Date;
  updatedAt!: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ purpose: 1, 'attachment.refId': 1 });
MediaSchema.index({ purpose: 1, deletingAt: 1, createdAt: 1 });
MediaSchema.index({ 'scan.status': 1, createdAt: 1 });
