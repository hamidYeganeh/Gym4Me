import type { Article, ArticleSummary } from "@repo/api";

export type ArticleDetailScreenProps = {
  article: Article;
  related: ArticleSummary[];
  coverUrl?: string | null;
};
