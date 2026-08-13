import type {
  ArticleAudience,
  ArticleKind,
  ListQuery,
  ListQueryFilter,
  PublishStatus,
} from "../types";
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

export type AdminArticlesSortBy =
  | "title"
  | "slug"
  | "publishStatus"
  | "category"
  | "kind"
  | "audience"
  | "publishedAt"
  | "readingTimeMinutes"
  | "viewsCount"
  | "likesCount"
  | "commentsCount"
  | "savesCount"
  | "createdAt"
  | "updatedAt";

export type ListAdminArticlesQuery = ListQuery<AdminArticlesSortBy> & {
  publishStatus?: ListQueryFilter<PublishStatus>;
  category?: string;
  kind?: ListQueryFilter<ArticleKind>;
  audience?: ListQueryFilter<ArticleAudience>;
  tag?: string;
};
