import type { SportNode } from "@repo/api";
import { statsColors, statsPalette } from "@repo/theme/stats-colors";
import { mapSportToHomeItem, type HomeSportItem } from "./home-browse-data";

export type HomeSportCategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconKey: string | null;
  image?: string;
  href: string;
};

export const PREFERRED_SPORT_CATEGORY_SLUGS = [
  "ball-sports",
  "fitness",
  "mind-body",
  "combat",
  "racket-sports",
  "aquatics",
  "endurance",
  "outdoor",
] as const;

export const PREFERRED_SPORT_SLUGS = [
  "football",
  "bodybuilding",
  "yoga",
  "pilates",
  "swimming",
  "boxing",
  "volleyball",
  "tennis",
  "crossfit",
  "karate",
] as const;

export const MAX_HOME_SPORT_CATEGORIES = 12;
export const MAX_HOME_SPORTS = 8;

export const HOME_SPORT_THEMES = [
  {
    color: "var(--accent)",
    foregroundColor: "var(--accent-foreground)",
    actionColor: "var(--accent-foreground)",
    actionForegroundColor: "var(--accent)",
  },
  ...statsPalette.map((color) => ({
    color,
    foregroundColor: statsColors.foreground,
    actionColor: "var(--eclipse)",
    actionForegroundColor: statsColors.foreground,
  })),
];

export function homeSportTheme(index: number) {
  return HOME_SPORT_THEMES[index % HOME_SPORT_THEMES.length]!;
}

export function sportHomeHref(sportId: string): string {
  return `/discovery/sports/${encodeURIComponent(sportId)}`;
}

export function sportCategoryHomeHref(categoryId: string): string {
  return `/discovery/sports?category=${encodeURIComponent(categoryId)}`;
}

function pickPreferred<T extends { id: string; slug: string }>(
  items: readonly T[],
  preferredSlugs: readonly string[],
  max: number,
): T[] {
  const active = items.filter(Boolean);
  const bySlug = new Map(active.map((item) => [item.slug, item]));
  const picked: T[] = [];
  const seen = new Set<string>();

  for (const slug of preferredSlugs) {
    const item = bySlug.get(slug);
    if (!item || seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
  }

  const rest = active.filter((item) => !seen.has(item.id));
  return [...picked, ...rest].slice(0, max);
}

export function mapSportNodesToHomeItems(
  nodes: readonly SportNode[],
  imageFor: (node: SportNode) => string | undefined = () => undefined,
): HomeSportItem[] {
  return pickPreferred(
    nodes
      .filter((node) => node.isActive && node.kind === "sport")
      .map((node) => mapSportToHomeItem(node, imageFor(node))),
    PREFERRED_SPORT_SLUGS,
    MAX_HOME_SPORTS,
  );
}

export function mapSportCategoryNodesToHomeItems(
  nodes: readonly SportNode[],
  imageFor: (node: SportNode) => string | undefined = () => undefined,
): HomeSportCategoryItem[] {
  return pickPreferred(
    nodes
      .filter((node) => node.isActive && node.kind === "category")
      .map((node) => ({
        id: node.id,
        slug: node.slug,
        name: node.name,
        description: node.description,
        iconKey: node.icon,
        image: imageFor(node),
        href: sportCategoryHomeHref(node.id),
      })),
    PREFERRED_SPORT_CATEGORY_SLUGS,
    MAX_HOME_SPORT_CATEGORIES,
  );
}
