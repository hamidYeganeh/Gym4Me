import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy, SocialPostStatus } from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type SocialPostDocument = HydratedDocument<SocialPost>;

@Schema({ timestamps: true, collection: 'social_posts' })
export class SocialPost {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  authorUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  body!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Media.name }], default: [] })
  mediaIds?: Types.ObjectId[];

  @Prop({
    type: String,
    enum: SocialPostStatus,
    default: SocialPostStatus.DRAFT,
    index: true,
  })
  status!: SocialPostStatus;

  /** Social posts use PUBLIC | FOLLOWERS (not PRIVATE). */
  @Prop({
    type: String,
    enum: [Privacy.PUBLIC, Privacy.FOLLOWERS],
    default: Privacy.FOLLOWERS,
    index: true,
  })
  visibility!: Privacy.PUBLIC | Privacy.FOLLOWERS;

  @Prop({ default: 0, min: 0 })
  likeCount!: number;

  @Prop({ default: 0, min: 0 })
  commentCount!: number;

  @Prop({ required: true })
  idempotencyKey!: string;

  @Prop({ required: true })
  idempotencyFingerprint!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialPostSchema = SchemaFactory.createForClass(SocialPost);

SocialPostSchema.index({ status: 1, visibility: 1, createdAt: -1 });
SocialPostSchema.index({ authorUserId: 1, createdAt: -1 });
SocialPostSchema.index(
  { authorUserId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);
