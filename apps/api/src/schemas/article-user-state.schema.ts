import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Article } from './article.schema';
import { User } from './user.schema';

export type ArticleUserStateDocument = HydratedDocument<ArticleUserState>;

/**
 * Per-user reaction state for an article.
 * Presence of `likedAt` / `savedAt` implies the reaction is active.
 */
@Schema({ timestamps: true, collection: 'article_user_states' })
export class ArticleUserState {
  @Prop({ type: Types.ObjectId, ref: Article.name, required: true })
  articleId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Date })
  likedAt?: Date;

  @Prop({ type: Date })
  savedAt?: Date;

  /** First time the viewer read the article (drives read-based points). */
  @Prop({ type: Date })
  readAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ArticleUserStateSchema =
  SchemaFactory.createForClass(ArticleUserState);

ArticleUserStateSchema.index({ articleId: 1, userId: 1 }, { unique: true });
ArticleUserStateSchema.index({ userId: 1, savedAt: -1 });
