import type { DiscoveryActionButtonVariant } from "@repo/api/discovery";
import type { DiscoverySectionSheetTone } from "../DiscoverySectionRail";

export type DiscoveryHomeCatalogRailItem = {
  id: string;
  title: string;
  eyebrow?: string;
  meta?: string;
  image?: string;
  href: string;
};

export type DiscoveryHomeCatalogRailVariant =
  "portrait" | "media" | "schedule" | "tile" | "pricing";

export type DiscoveryHomeCatalogRailSectionProps = {
  title: string;
  hint?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  seeAllVariant?: DiscoveryActionButtonVariant;
  items: DiscoveryHomeCatalogRailItem[];
  tone?: DiscoverySectionSheetTone;
  pattern?: boolean;
  variant?: DiscoveryHomeCatalogRailVariant;
};
