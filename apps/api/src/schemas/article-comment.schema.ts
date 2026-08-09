import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Article } from './article.schema';
import { User } from './user.schema';

export type ArticleCommentDocument = HydratedDocument<ArticleComment>;

@Schema({ timestamps: true, collection: 'article_comments' })
export class ArticleComment {
  @Prop({ type: Types.ObjectId, ref: Article.name, required: true, index: true })
  articleId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  body!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ArticleCommentSchema = SchemaFactory.createForClass(ArticleComment);

ArticleCommentSchema.index({ articleId: 1, createdAt: -1 });
