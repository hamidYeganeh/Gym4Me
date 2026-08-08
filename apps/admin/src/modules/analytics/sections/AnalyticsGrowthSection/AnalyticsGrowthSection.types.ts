import type { AnalyticsTrendPoint } from "../../lib/analytics-data";

export type AnalyticsGrowthSectionProps = {
  signupTrend: AnalyticsTrendPoint[];
  revenueTrend: AnalyticsTrendPoint[];
  className?: string;
};
