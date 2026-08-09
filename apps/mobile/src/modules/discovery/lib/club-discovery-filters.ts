import type { ClubSportFilter } from "./clubs-browse-data";

/** Q11 discovery filter chips (API query params). */
export type ClubDiscoveryFilterId =
  | "all"
  | "female_only"
  | "male_only"
  | "parking"
  | "accessible"
  | "kids"
  | "adults"
  | "premium"
  | "open24";

export type ClubDiscoveryFilter = {
  id: ClubDiscoveryFilterId;
  label: string;
  query?: {
    genderPolicy?: string;
    amenitySlug?: string;
    accessibility?: string;
    ageGroupKey?: string;
    levelKey?: string;
  };
};

export const CLUB_DISCOVERY_FILTERS: ClubDiscoveryFilter[] = [
  { id: "all", label: "همه" },
  {
    id: "female_only",
    label: "بانوان",
    query: { genderPolicy: "female_only" },
  },
  {
    id: "male_only",
    label: "آقایان",
    query: { genderPolicy: "male_only" },
  },
  {
    id: "parking",
    label: "پارکینگ",
    query: { amenitySlug: "parking" },
  },
  {
    id: "accessible",
    label: "دسترسی‌پذیر",
    query: { accessibility: "accessible" },
  },
  {
    id: "kids",
    label: "کودکان",
    query: { ageGroupKey: "kids" },
  },
  {
    id: "adults",
    label: "بزرگسالان",
    query: { ageGroupKey: "adults" },
  },
  {
    id: "premium",
    label: "پریمیوم",
    query: { levelKey: "premium" },
  },
  {
    id: "open24",
    label: "شبانه‌روزی",
    query: { amenitySlug: "24h" },
  },
];

/** Resolve a chip filter from discovery deep-link query params. */
export function matchDiscoveryFilterFromQuery(query: {
  genderPolicy?: string | null;
  amenitySlug?: string | null;
  accessibility?: string | null;
  ageGroupKey?: string | null;
  levelKey?: string | null;
}): ClubDiscoveryFilterId {
  for (const filter of CLUB_DISCOVERY_FILTERS) {
    if (filter.id === "all" || !filter.query) continue;
    const q = filter.query;
    if (q.genderPolicy && q.genderPolicy === query.genderPolicy) return filter.id;
    if (q.amenitySlug && q.amenitySlug === query.amenitySlug) return filter.id;
    if (q.accessibility && q.accessibility === query.accessibility)
      return filter.id;
    if (q.ageGroupKey && q.ageGroupKey === query.ageGroupKey) return filter.id;
    if (q.levelKey && q.levelKey === query.levelKey) return filter.id;
  }
  return "all";
}

/** @deprecated Prefer CLUB_DISCOVERY_FILTERS for Q11. */
export const CLUB_SPORT_FILTERS_FALLBACK: ClubSportFilter[] = [
  { id: "all", label: "همه" },
  { id: "fitness", label: "فیتنس" },
  { id: "crossfit", label: "کراس‌فیت" },
  { id: "yoga", label: "یوگا" },
  { id: "swimming", label: "شنا" },
  { id: "martial-arts", label: "رزمی" },
];
