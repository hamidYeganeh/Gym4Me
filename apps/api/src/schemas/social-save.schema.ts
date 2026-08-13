import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SocialPost } from './social-post.schema';
import { User } from './user.schema';

export type SocialSaveDocument = HydratedDocument<SocialSave>;

@Schema({ timestamps: true, collection: 'social_saves' })
export class SocialSave {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: SocialPost.name,
    required: true,
    index: true,
  })
  postId!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialSaveSchema = SchemaFactory.createForClass(SocialSave);

SocialSaveSchema.index({ userId: 1, postId: 1 }, { unique: true });
