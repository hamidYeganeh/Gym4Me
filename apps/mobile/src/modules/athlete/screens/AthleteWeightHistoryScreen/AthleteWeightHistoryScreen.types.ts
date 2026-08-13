import type { MetricSlug } from "@/modules/athlete/lib/weight/metrics";
import type { WeightHistoryEntry } from "@/modules/athlete/lib/weight/weight-history-data";

export type AthleteWeightHistoryScreenProps = {
  metric: MetricSlug;
  entries: WeightHistoryEntry[];
  onDelete?: (id: string) => void | Promise<void>;
};
