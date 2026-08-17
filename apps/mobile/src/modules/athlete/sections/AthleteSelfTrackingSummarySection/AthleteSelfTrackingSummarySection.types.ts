import type { MetricsSummaryItem } from "@repo/api";

export type AthleteSelfTrackingSummarySectionProps = {
  summary: MetricsSummaryItem;
  unitLabel: string;
  formatSummaryValue: (value: number | null, unitLabel: string) => string;
  formatDate: (value: string) => string;
  className?: string;
};
