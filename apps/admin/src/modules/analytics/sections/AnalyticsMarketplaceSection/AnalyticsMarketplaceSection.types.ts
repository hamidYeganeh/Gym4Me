import type { MarketplaceEntry } from "../../lib/analytics-data";

export type AnalyticsMarketplaceSectionProps = {
  topClubs: MarketplaceEntry[];
  topCoaches: MarketplaceEntry[];
  className?: string;
};
