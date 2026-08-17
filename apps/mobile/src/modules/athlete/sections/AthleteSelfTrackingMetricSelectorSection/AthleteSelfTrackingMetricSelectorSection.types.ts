import type { SelfTrackingMetric } from "@/modules/athlete/lib/self-tracking-data";

export type AthleteSelfTrackingMetricSelectorSectionProps = {
  catalog: SelfTrackingMetric[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
};
