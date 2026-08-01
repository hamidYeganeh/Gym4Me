import type { ReorderableMetric } from "../../lib/metrics-reorder-data";

export type AthleteMetricsReorderLabels = {
  weight: string;
  bloodPressure: string;
  heartRate: string;
  sleep: string;
  nutrition: string;
  hydration: string;
  respiration: string;
  removeLabel: string;
  dragLabel: string;
};

export type AthleteMetricsReorderListSectionProps = {
  metrics: ReorderableMetric[];
  labels: AthleteMetricsReorderLabels;
  onReorder: (metrics: ReorderableMetric[]) => void;
  onRemove: (id: ReorderableMetric["id"]) => void;
};
