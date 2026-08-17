import type { SelfTrackingMetric } from "@/modules/athlete/lib/self-tracking-data";

export type AthleteSelfTrackingMetricFormSectionProps = {
  metric: SelfTrackingMetric;
  value: string;
  recordedAt: string;
  note: string;
  pending?: boolean;
  message?: string | null;
  error?: string | null;
  onValueChange: (value: string) => void;
  onRecordedAtChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  className?: string;
};
