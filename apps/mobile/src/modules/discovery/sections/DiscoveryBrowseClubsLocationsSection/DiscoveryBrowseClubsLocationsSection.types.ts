import type { HomeLocationItem } from "../../lib/home-browse-data";

export type DiscoveryBrowseClubsLocationVariant =
  | "provinces"
  | "cities"
  | "districts";

export type DiscoveryBrowseClubsLocationsSectionProps = {
  variant: DiscoveryBrowseClubsLocationVariant;
  items: HomeLocationItem[];
};
