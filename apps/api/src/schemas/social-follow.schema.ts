import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SocialFolloweeKind } from '../common/enums';
import { User } from './user.schema';

export type SocialFollowDocument = HydratedDocument<SocialFollow>;

@Schema({ timestamps: true, collection: 'social_follows' })
export class SocialFollow {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  followerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  followeeId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: SocialFolloweeKind,
    required: true,
    index: true,
  })
  followeeKind!: SocialFolloweeKind;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialFollowSchema = SchemaFactory.createForClass(SocialFollow);

SocialFollowSchema.index(
  { followerId: 1, followeeId: 1, followeeKind: 1 },
  { unique: true },
);
SocialFollowSchema.index({ followeeId: 1, followeeKind: 1, createdAt: -1 });
