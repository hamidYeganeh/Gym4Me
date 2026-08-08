import type {
  OwnerAnalyticsDataset,
  OwnerAnalyticsPeriodId,
} from "../../lib/owner-analytics-data";

export type OwnerAnalyticsScreenProps = {
  datasets: Record<OwnerAnalyticsPeriodId, OwnerAnalyticsDataset>;
  periods: OwnerAnalyticsPeriodId[];
  className?: string;
};
