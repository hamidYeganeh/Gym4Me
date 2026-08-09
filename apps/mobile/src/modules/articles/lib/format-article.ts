import type { ArticleAudience, ArticleKind } from "@repo/api";

export const ARTICLE_KINDS: ArticleKind[] = [
  "guide",
  "news",
  "tip",
  "story",
  "workout",
];

export const ARTICLE_AUDIENCES: ArticleAudience[] = [
  "all",
  "athlete",
  "coach",
  "club_owner",
];

export function formatArticleDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact relative time for feed cards (e.g. "2d ago"). */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatCategoryLabel(category: string): string {
  if (!category) return "";
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Capacitor static export cannot pre-render unknown `[slug]` paths. */
export function articleDetailHref(slug: string): string {
  return `/articles/detail?slug=${encodeURIComponent(slug)}`;
}
