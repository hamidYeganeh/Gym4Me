import type { ArticleKind, ArticleSummary } from "@repo/api";
import { formatJalaliFullDate } from "@/shared/lib/booking-view";

export type HomeEditorialArticle = {
  id: string;
  slug: string;
  title: string;
  kind: ArticleKind;
  authorName: string;
  publishedAtLabel: string;
  readingTimeMinutes: number;
};

export const MAX_HOME_ARTICLES = 8;

export function formatArticleJalaliDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatJalaliFullDate(iso).replace(/^(\S+)\s/, "$1، ");
}

export function articleHomeHref(slug: string): string {
  return `/articles/detail?slug=${encodeURIComponent(slug)}`;
}

export function mapArticleToEditorialHomeItem(
  article: ArticleSummary,
): HomeEditorialArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    kind: article.taxonomy.kind,
    authorName: article.author.name || "Gym4Me",
    publishedAtLabel: formatArticleJalaliDate(
      article.publishedAt ?? article.createdAt,
    ),
    readingTimeMinutes: article.readingTimeMinutes,
  };
}
