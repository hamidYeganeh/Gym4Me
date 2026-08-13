import type { PersonalRecord, ProgressMetric } from "@repo/api";
import type {
  SelfTrackingMetricKey,
} from "../../lib/self-tracking-data";

export type AthleteSelfTrackingScreenProps = {
  metrics: ProgressMetric[];
  personalRecords: PersonalRecord[];
  pending?: boolean;
  personalRecordsEnabled?: boolean;
  initialMetric?: SelfTrackingMetricKey;
  onCreateMetric: (input: {
    metricKey: SelfTrackingMetricKey;
    value: number;
    recordedAt: string;
    unit: string;
    note?: string;
  }) => Promise<void>;
  onDeleteMetric: (id: string) => Promise<void>;
  onCreatePersonalRecord: (input: {
    metricTypeKey: string;
    value: number;
    achievedAt: string;
    note?: string;
  }) => Promise<void>;
};

