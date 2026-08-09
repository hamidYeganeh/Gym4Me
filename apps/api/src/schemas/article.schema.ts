import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ArticleAudience,
  ArticleKind,
  PublishStatus,
} from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ _id: false })
export class ArticleSeo {
  @Prop({ trim: true, maxlength: 120 })
  title?: string;

  @Prop({ trim: true, maxlength: 300 })
  description?: string;
}

export const ArticleSeoSchema = SchemaFactory.createForClass(ArticleSeo);

@Schema({ _id: false })
export class ArticleTaxonomy {
  /** Topic category slug (e.g. wellness, bodybuilding). */
  @Prop({ required: true, lowercase: true, trim: true, index: true })
  category!: string;

  /** Editorial format that divides article types. */
  @Prop({
    type: String,
    enum: ArticleKind,
    default: ArticleKind.GUIDE,
    index: true,
  })
  kind!: ArticleKind;

  /** Intended reader segment. */
  @Prop({
    type: String,
    enum: ArticleAudience,
    default: ArticleAudience.ALL,
    index: true,
  })
  audience!: ArticleAudience;
}

export const ArticleTaxonomySchema =
  SchemaFactory.createForClass(ArticleTaxonomy);

@Schema({ _id: false })
export class ArticleEngagement {
  @Prop({ default: 0, min: 0 })
  viewsCount!: number;

  @Prop({ default: 0, min: 0 })
  likesCount!: number;

  @Prop({ default: 0, min: 0 })
  commentsCount!: number;

  @Prop({ default: 0, min: 0 })
  savesCount!: number;
}

export const ArticleEngagementSchema =
  SchemaFactory.createForClass(ArticleEngagement);

@Schema({ timestamps: true, collection: 'articles' })
export class Article {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ trim: true, maxlength: 500 })
  excerpt?: string;

  /** HTML body from the admin rich-text editor. */
  @Prop({ required: true, maxlength: 500_000 })
  body!: string;

  @Prop({ type: ArticleTaxonomySchema, required: true })
  taxonomy!: ArticleTaxonomy;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
    index: true,
  })
  publishStatus!: PublishStatus;

  /** Set when the article first becomes published; kept on unpublish. */
  @Prop({ type: Date })
  publishedAt?: Date;

  /** Estimated minutes to read; recomputed when body changes. */
  @Prop({ default: 1, min: 1 })
  readingTimeMinutes!: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: ArticleSeoSchema, default: () => ({}) })
  seo!: ArticleSeo;

  @Prop({
    type: ArticleEngagementSchema,
    default: () => ({
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      savesCount: 0,
    }),
  })
  engagement!: ArticleEngagement;

  @Prop({ type: Types.ObjectId, ref: User.name })
  authorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.index({ slug: 1 }, { unique: true });
ArticleSchema.index({ publishStatus: 1, publishedAt: -1 });
ArticleSchema.index({
  publishStatus: 1,
  'taxonomy.category': 1,
  publishedAt: -1,
});
ArticleSchema.index({
  publishStatus: 1,
  'taxonomy.kind': 1,
  publishedAt: -1,
});
ArticleSchema.index({
  publishStatus: 1,
  'taxonomy.audience': 1,
  publishedAt: -1,
});
