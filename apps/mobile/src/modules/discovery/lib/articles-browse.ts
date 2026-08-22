import type { ArticleKind, ArticleSummary, PaginationMeta } from "@repo/api";
import { articleHomeHref, formatArticleJalaliDate } from "./articles-home";

export const ARTICLE_BROWSE_KINDS: ArticleKind[] = [
  "guide",
  "news",
  "tip",
  "story",
  "workout",
];

export const ARTICLES_PAGE_SIZE = 10;

export type ArticleKindFilterId = ArticleKind | "all";

export type BrowseArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  kind: ArticleKind;
  authorName: string;
  authorAvatarSrc: string | null;
  coverSrc: string | null;
  publishedAtLabel: string;
  readingTimeMinutes: number;
  href: string;
};

export function articlesBrowseHref(kind?: ArticleKindFilterId): string {
  if (!kind || kind === "all") return "/discovery/articles";
  return `/discovery/articles?kind=${encodeURIComponent(kind)}`;
}

export function resolveArticleKindParam(
  value: string | null | undefined,
): ArticleKindFilterId {
  if (!value) return "all";
  return ARTICLE_BROWSE_KINDS.includes(value as ArticleKind)
    ? (value as ArticleKind)
    : "all";
}

export function nextArticlePage(
  pagination: Pick<PaginationMeta, "next"> | undefined,
): number | null {
  return pagination?.next ?? null;
}

export function appendUniqueArticles(
  current: readonly BrowseArticle[],
  incoming: readonly BrowseArticle[],
): BrowseArticle[] {
  const seen = new Set(current.map((article) => article.id));
  const next = [...current];
  for (const article of incoming) {
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    next.push(article);
  }
  return next;
}

export function mapArticleToBrowseItem(
  article: ArticleSummary,
  coverSrc: string | null,
  authorAvatarSrc: string | null,
): BrowseArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    kind: article.taxonomy.kind,
    authorName: article.author.name || "Gym4Me",
    authorAvatarSrc,
    coverSrc,
    publishedAtLabel: formatArticleJalaliDate(
      article.publishedAt ?? article.createdAt,
    ),
    readingTimeMinutes: article.readingTimeMinutes,
    href: articleHomeHref(article.slug),
  };
}
