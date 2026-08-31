import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { DiscoverySectionSheetTone } from "../DiscoverySectionRail";

export type DiscoveryHomeClubsColumnSectionProps = {
  clubs: BrowseClub[];
  title: string;
  hint?: string;
  ariaLabel: string;
  keyPrefix: string;
  isLoading?: boolean;
  tone?: DiscoverySectionSheetTone;
  pattern?: boolean;
  seeAllHref?: string;
  seeAllLabel?: string;
  seeAllVariant?: "primary" | "secondary" | "tertiary" | "ghost" | "outline";
};
