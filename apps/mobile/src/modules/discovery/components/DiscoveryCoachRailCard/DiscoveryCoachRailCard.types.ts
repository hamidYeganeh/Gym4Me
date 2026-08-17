import type { BrowseCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachRailCardProps = {
  coach: BrowseCoach;
  orientation: "horizontal" | "vertical" | "fullWidth";
  className: string;
  actionLabel: string;
  pricePrefix: string;
  priceSuffix: string;
  favoriteLabel: string;
  shareLabel: string;
  onOpen: () => void;
};
