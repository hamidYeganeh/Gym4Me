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
  return date.toLocaleDateString("fa-IR");
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 60) return `${Math.max(1, minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  return formatArticleDate(iso);
}

export function formatCategoryLabel(category: string): string {
  if (!category) return "";
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}
