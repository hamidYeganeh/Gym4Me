import type { HomeLocationItem } from "../../lib/home-browse-data";

export type DiscoveryBrowseCoachesLocationVariant =
  | "provinces"
  | "cities"
  | "districts";

export type DiscoveryBrowseCoachesLocationsSectionProps = {
  variant: DiscoveryBrowseCoachesLocationVariant;
  items: HomeLocationItem[];
};
