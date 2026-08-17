import type { BrowseClub } from "../../lib/clubs-browse-data";

export type DiscoveryClubRailCardProps = {
  club: BrowseClub;
  orientation: "horizontal" | "vertical" | "fullWidth";
  className: string;
  actionLabel: string;
  pricePrefix?: string;
  priceSuffix?: string;
  favoriteLabel: string;
  shareLabel: string;
  onOpen: () => void;
};
