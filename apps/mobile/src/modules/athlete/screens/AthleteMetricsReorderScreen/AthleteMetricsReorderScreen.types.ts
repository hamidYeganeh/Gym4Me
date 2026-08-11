import type { ReorderableMetric } from "../../lib/metrics-reorder-data";

export type AthleteMetricsReorderScreenProps = {
  initialMetrics: ReorderableMetric[];
  onPersist?: (metrics: ReorderableMetric[]) => Promise<void> | void;
};
