import type { ClubClass } from "../account/club-slots.dto";

export type DiscoveryClassesQuery = {
  page?: number;
  limit?: number;
  page_size?: number;
  q?: string;
  clubId?: string;
  sportId?: string;
  coachId?: string;
};

export type DiscoveryClassClub = {
  id: string;
  name: string;
  coverMediaId: string | null;
};

/** Public class card/detail with owning club summary. */
export type DiscoveryClass = ClubClass & {
  club: DiscoveryClassClub;
};
