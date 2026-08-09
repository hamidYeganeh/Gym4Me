import type { ArticleAudience, ArticleKind, PublishStatus } from "../types";
import type {
  ArticleAuthor,
  ArticleEngagement,
  ArticleSeo,
  ArticleTaxonomy,
} from "../articles/articles.dto";

export type AdminArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  taxonomy: ArticleTaxonomy;
  coverMediaId: string | null;
  publishStatus: PublishStatus;
  publishedAt: string | null;
  readingTimeMinutes: number;
  tags: string[];
  engagement: ArticleEngagement;
  author: ArticleAuthor;
  seo: ArticleSeo;
  createdAt: string;
  updatedAt: string;
};

export type CreateArticleInput = {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  taxonomy: {
    category: string;
    kind?: ArticleKind;
    audience?: ArticleAudience;
  };
  coverMediaId?: string;
  publishStatus?: PublishStatus;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
  };
};

export type UpdateArticleInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string;
  taxonomy?: {
    category: string;
    kind?: ArticleKind;
    audience?: ArticleAudience;
  };
  coverMediaId?: string | null;
  publishStatus?: PublishStatus;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
  };
};

export type ListAdminArticlesQuery = {
  page?: number;
  page_size?: number;
  publishStatus?: PublishStatus;
  search?: string;
  category?: string;
  kind?: ArticleKind;
  audience?: ArticleAudience;
  tag?: string;
};
