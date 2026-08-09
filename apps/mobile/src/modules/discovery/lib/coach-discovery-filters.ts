/** Discovery filter chips for coaches browse. */
export type CoachDiscoveryFilterId =
  | "all"
  | "remote"
  | "in-person"
  | "certified"
  | "new"
  | "hiit"
  | "yoga"
  | "strength"
  | "mobility";

export type CoachDiscoveryFilter = {
  id: CoachDiscoveryFilterId;
  label: string;
  query?: {
    availability?: "remote" | "in-person";
    verified?: "1";
    fresh?: "1";
    specialtyKey?: string;
  };
};

export const COACH_DISCOVERY_FILTERS: CoachDiscoveryFilter[] = [
  { id: "all", label: "همه" },
  {
    id: "remote",
    label: "آنلاین",
    query: { availability: "remote" },
  },
  {
    id: "in-person",
    label: "حضوری",
    query: { availability: "in-person" },
  },
  {
    id: "certified",
    label: "تأییدشده",
    query: { verified: "1" },
  },
  {
    id: "new",
    label: "جدید",
    query: { fresh: "1" },
  },
  {
    id: "hiit",
    label: "HIIT",
    query: { specialtyKey: "hiit" },
  },
  {
    id: "yoga",
    label: "یوگا",
    query: { specialtyKey: "yoga" },
  },
  {
    id: "strength",
    label: "قدرتی",
    query: { specialtyKey: "strength" },
  },
  {
    id: "mobility",
    label: "موبیلیتی",
    query: { specialtyKey: "mobility" },
  },
];

/** Resolve a chip filter from discovery deep-link query params. */
export function matchCoachDiscoveryFilterFromQuery(query: {
  specialtyKey?: string | null;
  availability?: string | null;
  verified?: string | null;
  fresh?: string | null;
}): CoachDiscoveryFilterId {
  for (const filter of COACH_DISCOVERY_FILTERS) {
    if (filter.id === "all" || !filter.query) continue;
    const q = filter.query;
    if (q.availability && q.availability === query.availability) return filter.id;
    if (q.verified && (query.verified === "1" || query.verified === "true"))
      return filter.id;
    if (q.fresh && (query.fresh === "1" || query.fresh === "true"))
      return filter.id;
    if (q.specialtyKey && q.specialtyKey === query.specialtyKey) return filter.id;
  }
  return "all";
}
