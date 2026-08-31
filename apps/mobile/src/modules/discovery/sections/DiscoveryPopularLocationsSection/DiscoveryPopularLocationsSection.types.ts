import type { HomeLocationItem, HomeLocationKind } from "../../lib/home-browse-data";

export type DiscoveryPopularLocationsTarget = "clubs" | "coaches";

export type DiscoveryPopularLocationsSectionProps = {
  locations: HomeLocationItem[];
  kind?: HomeLocationKind;
  target?: DiscoveryPopularLocationsTarget;
  title?: string;
  hint?: string;
  ariaLabel?: string;
  isLoading?: boolean;
  seeAllHref?: string;
  seeAllLabel?: string;
  maxItems?: number;
};
