import type { HomeLocationItem } from "../../lib/home-browse-data";

export type DiscoveryHomeCitiesSectionProps = {
  cities: HomeLocationItem[];
  isLoading?: boolean;
  /** Omit or pass `null` to hide the see-all control. */
  seeAllHref?: string | null;
};
