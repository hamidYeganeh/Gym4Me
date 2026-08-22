import type { RefItem } from "@repo/api";

export type HomeClubCategoryItem = {
  id: string;
  slug: string;
  name: string;
  iconKey: string | null;
  href: string;
  count?: number | null;
};

/** Featured venue types shown first on `/discovery` when present. */
export const PREFERRED_CLUB_CATEGORY_SLUGS = [
  "gym",
  "womens-gym",
  "mens-gym",
  "yoga-studio",
  "crossfit-box",
  "weightlifting-club",
  "functional-studio",
  "martial-arts-club",
  "wrestling-club",
  "zurkhaneh",
  "pool",
  "multi-sport",
  "pilates-studio",
  "boxing-gym",
  "football",
  "group-class",
  "dance-studio",
  "gymnastics-academy",
  "personal-training-studio",
  "indoor-arena",
  "climbing-gym",
  "kids-sports-academy",
  "racket-sports-club",
  "padel-club",
  "squash-club",
  "volleyball-hall",
  "basketball-court",
  "cycling-club",
] as const;

export const MAX_HOME_CLUB_CATEGORIES = 36;

export function mapClubCategoryRefsToHomeItems(
  refs: readonly RefItem[],
  countsById?: ReadonlyMap<string, number>,
): HomeClubCategoryItem[] {
  const active = refs.filter((item) => item.isActive);
  const bySlug = new Map(active.map((item) => [item.slug, item]));
  const picked: RefItem[] = [];
  const seen = new Set<string>();

  for (const slug of PREFERRED_CLUB_CATEGORY_SLUGS) {
    const item = bySlug.get(slug);
    if (!item || seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
  }

  const rest = active
    .filter((item) => !seen.has(item.id))
    .sort((a, b) => a.order - b.order);

  return [...picked, ...rest]
    .slice(0, MAX_HOME_CLUB_CATEGORIES)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      iconKey: item.icon,
      href: `/discovery/clubs?categoryId=${encodeURIComponent(item.id)}`,
      count: countsById ? (countsById.get(item.id) ?? 0) : null,
    }));
}
