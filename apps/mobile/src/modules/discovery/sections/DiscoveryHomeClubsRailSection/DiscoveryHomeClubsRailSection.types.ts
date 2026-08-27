import type { DiscoveryActionButtonVariant } from "@repo/api/discovery";
import type { BrowseClub } from "../../lib/clubs-browse-data";
import type { DiscoverySectionSheetTone } from "../DiscoverySectionRail";

export type DiscoveryHomeClubsRailSectionProps = {
  clubs: BrowseClub[];
  title: string;
  hint?: string;
  ariaLabel: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  seeAllVariant?: DiscoveryActionButtonVariant;
  orientation?: "horizontal" | "vertical";
  keyPrefix: string;
  isLoading?: boolean;
  tone?: DiscoverySectionSheetTone;
  pattern?: boolean;
};
