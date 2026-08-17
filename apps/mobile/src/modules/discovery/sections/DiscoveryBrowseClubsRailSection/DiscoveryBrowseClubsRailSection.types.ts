import type { BrowseClub } from "../../lib/clubs-browse-data";

export type DiscoveryBrowseClubsRailVariant =
  | "featured"
  | "nearby"
  | "openNow"
  | "topRated"
  | "picks";

export type DiscoveryBrowseClubsRailSectionProps = {
  variant: DiscoveryBrowseClubsRailVariant;
  clubs: BrowseClub[];
};
