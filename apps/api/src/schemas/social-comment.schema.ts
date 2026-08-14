import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SocialPostStatus } from '../common/enums';
import { SocialPost } from './social-post.schema';
import { User } from './user.schema';

export type SocialCommentDocument = HydratedDocument<SocialComment>;

@Schema({ timestamps: true, collection: 'social_comments' })
export class SocialComment {
  @Prop({
    type: Types.ObjectId,
    ref: SocialPost.name,
    required: true,
    index: true,
  })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  authorUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  body!: string;

  @Prop({
    type: String,
    enum: SocialPostStatus,
    default: SocialPostStatus.PUBLISHED,
    index: true,
  })
  status!: SocialPostStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialCommentSchema = SchemaFactory.createForClass(SocialComment);

SocialCommentSchema.index({ postId: 1, createdAt: -1 });
