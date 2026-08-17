import type { SelfTrackingMetric } from "@/modules/athlete/lib/self-tracking-data";

export type AthleteSelfTrackingHistoryItem = {
  id: string;
  value: number;
  recordedAt: string;
  pending: boolean;
  deletable: boolean;
};

export type AthleteSelfTrackingHistorySectionProps = {
  metric: SelfTrackingMetric;
  items: AthleteSelfTrackingHistoryItem[];
  pending?: boolean;
  formatDate: (value: string) => string;
  onDelete: (id: string) => void | Promise<void>;
  className?: string;
};
