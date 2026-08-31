import type { BrowseClub } from "../../lib/clubs-browse-data";

export type DiscoveryClubRailCardProps = {
  club: BrowseClub;
  orientation: "horizontal" | "vertical" | "fullWidth" | "listing";
  className: string;
  actionLabel?: string;
  pricePrefix?: string;
  priceSuffix?: string;
  statusOpenLabel?: string;
  statusClosedLabel?: string;
  favoriteLabel: string;
  shareLabel: string;
  onOpen: () => void;
};
