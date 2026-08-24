import type { HomeSportItem } from "../../lib/home-browse-data";

export type DiscoveryHomeSportsSectionProps = {
  sports: HomeSportItem[];
  isLoading?: boolean;
  title?: string;
  hint?: string;
  seeAllHref?: string;
};
