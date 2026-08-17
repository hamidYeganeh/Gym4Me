import type { BrowseClub } from "../../lib/clubs-browse-data";

export type DiscoveryHomeClubsRailSectionProps = {
  clubs: BrowseClub[];
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllHref: string;
  orientation?: "horizontal" | "vertical";
  keyPrefix: string;
};
