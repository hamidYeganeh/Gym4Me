import type { ArticleAudience, ArticleKind } from "../types";

export type ArticleSeo = {
  title: string | null;
  description: string | null;
};

export type ArticleTaxonomy = {
  category: string;
  kind: ArticleKind;
  audience: ArticleAudience;
};

export type ArticleAuthor = {
  id: string | null;
  name: string;
  avatarMediaId: string | null;
};

export type ArticleEngagement = {
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
};

export type ArticleViewerState = {
  liked: boolean;
  saved: boolean;
  read: boolean;
};

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  taxonomy: ArticleTaxonomy;
  coverMediaId: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number;
  tags: string[];
  engagement: ArticleEngagement;
  author: ArticleAuthor;
  seo: ArticleSeo;
  createdAt: string;
  updatedAt: string;
};

export type Article = ArticleSummary & {
  body: string;
};

export type ArticleComment = {
  id: string;
  articleId: string;
  body: string;
  author: ArticleAuthor;
  createdAt: string;
  updatedAt: string;
};

export type ArticleFacetItem = {
  key: string;
  count: number;
};

export type ArticleFacets = {
  categories: ArticleFacetItem[];
  kinds: ArticleFacetItem[];
  audiences: ArticleFacetItem[];
};

export type ListArticlesQuery = {
  page?: number;
  page_size?: number;
  category?: string;
  kind?: ArticleKind;
  audience?: ArticleAudience;
  tag?: string;
};

export type ListArticleCommentsQuery = {
  page?: number;
  page_size?: number;
};

export type CreateArticleCommentInput = {
  body: string;
};

export type ArticleEngagementResponse = {
  engagement: ArticleEngagement;
  viewer: ArticleViewerState;
};
