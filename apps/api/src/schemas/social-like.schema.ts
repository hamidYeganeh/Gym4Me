import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SocialPost } from './social-post.schema';
import { User } from './user.schema';

export type SocialLikeDocument = HydratedDocument<SocialLike>;

@Schema({ timestamps: true, collection: 'social_likes' })
export class SocialLike {
  @Prop({
    type: Types.ObjectId,
    ref: SocialPost.name,
    required: true,
    index: true,
  })
  postId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialLikeSchema = SchemaFactory.createForClass(SocialLike);

SocialLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
