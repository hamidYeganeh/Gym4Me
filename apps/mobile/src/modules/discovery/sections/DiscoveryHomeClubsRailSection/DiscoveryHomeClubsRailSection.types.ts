import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { DiscoverySectionSheetTone } from "../DiscoverySectionRail";

export type DiscoveryHomeClubsRailSectionProps = {
  clubs: BrowseClub[];
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllHref?: string;
  orientation?: "horizontal" | "vertical";
  keyPrefix: string;
  isLoading?: boolean;
  tone?: DiscoverySectionSheetTone;
  pattern?: boolean;
};
