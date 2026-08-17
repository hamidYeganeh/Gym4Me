import type { ArticleAudience, ArticleKind } from "@repo/api";
import {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  formatArticleDate,
  formatCategoryLabel,
  formatCount,
  formatRelativeTime,
} from "./lib/format-article";

export {
  ARTICLE_AUDIENCES,
  ARTICLE_KINDS,
  formatArticleDate,
  formatCategoryLabel,
  formatCount,
  formatRelativeTime,
};

export function parseArticleKind(value?: string): ArticleKind | undefined {
  if (!value) return undefined;
  return ARTICLE_KINDS.includes(value as ArticleKind)
    ? (value as ArticleKind)
    : undefined;
}

export function parseArticleAudience(
  value?: string,
): ArticleAudience | undefined {
  if (!value) return undefined;
  return ARTICLE_AUDIENCES.includes(value as ArticleAudience)
    ? (value as ArticleAudience)
    : undefined;
}
