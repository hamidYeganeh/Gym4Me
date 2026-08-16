import { statsColors } from "@repo/theme";
import { MOCK_SPORTS, type HomeSportItem } from "./home-browse-data";
import {
  BROWSE_CLUBS,
  type BrowseClub,
  type ClubSportFilterId,
} from "./clubs-browse-data";

export type BrowseSport = HomeSportItem & {
  color: string;
  /** Maps to club browse `sportIds` when filtering related clubs. */
  clubSportKey?: Exclude<ClubSportFilterId, "all">;
};

export type SportCategoryFilterId = "all" | string;

export type SportCategoryFilter = {
  id: SportCategoryFilterId;
  label: string;
};

const SPORT_COLORS = [
  statsColors.blue,
  statsColors.orange,
  statsColors.yellow,
  statsColors.purple,
  statsColors.red,
  "var(--accent)",
] as const;

/** Demo catalog for `/discovery/sports` (replaceable by API adapters). */
export const BROWSE_SPORTS: BrowseSport[] = MOCK_SPORTS.map((sport, index) => ({
  ...sport,
  color: SPORT_COLORS[index % SPORT_COLORS.length]!,
  clubSportKey: clubSportKeyForSlug(sport.slug),
}));

function clubSportKeyForSlug(
  slug: string,
): Exclude<ClubSportFilterId, "all"> | undefined {
  switch (slug) {
    case "bodybuilding":
    case "football":
      return "fitness";
    case "crossfit":
      return "crossfit";
    case "yoga":
      return "yoga";
    case "swimming":
      return "swimming";
    case "boxing":
      return "martial-arts";
    default:
      return undefined;
  }
}

export function buildSportCategoryFilters(
  sports: BrowseSport[],
): SportCategoryFilter[] {
  const seen = new Set<string>();
  const filters: SportCategoryFilter[] = [{ id: "all", label: "همه" }];
  for (const sport of sports) {
    const key = (sport.description ?? "").trim() || "عمومی";
    if (seen.has(key)) continue;
    seen.add(key);
    filters.push({ id: key, label: key });
  }
  return filters;
}

export function filterBrowseSports(
  sports: BrowseSport[],
  categoryId: SportCategoryFilterId,
): BrowseSport[] {
  if (categoryId === "all") return sports;
  return sports.filter((sport) => {
    const key = (sport.description ?? "").trim() || "عمومی";
    return key === categoryId;
  });
}

export function getBrowseSport(sportId: string): BrowseSport | undefined {
  const id = sportId.trim();
  if (!id) return undefined;
  return BROWSE_SPORTS.find((sport) => sport.id === id || sport.slug === id);
}

export function clubsForSport(
  sport: BrowseSport,
  clubs: BrowseClub[] = BROWSE_CLUBS,
): BrowseClub[] {
  if (!sport.clubSportKey) return clubs.slice(0, 4);
  const matched = clubs.filter((club) =>
    club.sportIds.includes(sport.clubSportKey!),
  );
  return matched.length > 0 ? matched : clubs.slice(0, 3);
}

export function getAllSportIds(): string[] {
  return BROWSE_SPORTS.map((sport) => sport.id);
}
