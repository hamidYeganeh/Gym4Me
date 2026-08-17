import type { GamificationOverview } from "@repo/api";

export type PointsLedgerOverviewSectionProps = {
  overview: GamificationOverview | null;
  overviewError: string | null;
  className?: string;
};
