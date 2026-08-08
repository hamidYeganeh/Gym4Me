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
  | "premium";

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
];

/** @deprecated Prefer CLUB_DISCOVERY_FILTERS for Q11. */
export const CLUB_SPORT_FILTERS_FALLBACK: ClubSportFilter[] = [
  { id: "all", label: "همه" },
  { id: "fitness", label: "فیتنس" },
  { id: "crossfit", label: "کراس‌فیت" },
  { id: "yoga", label: "یوگا" },
  { id: "swimming", label: "شنا" },
  { id: "martial-arts", label: "رزمی" },
];
