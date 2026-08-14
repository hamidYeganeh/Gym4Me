import type {
  MetricsSummaryItem,
  PersonalRecord,
  ProgressMetric,
} from "@repo/api";
import type { OfflineQueueItem } from "@/shared/lib/offline-queue";
import type { SelfTrackingMetric } from "../../lib/self-tracking-data";

export type AthleteSelfTrackingScreenProps = {
  catalog: SelfTrackingMetric[];
  metrics: ProgressMetric[];
  personalRecords: PersonalRecord[];
  summary?: MetricsSummaryItem[];
  pendingQueue?: OfflineQueueItem[];
  pending?: boolean;
  personalRecordsEnabled?: boolean;
  initialMetric?: string;
  onCreateMetric: (input: {
    metricKey: string;
    value: number;
    recordedAt: string;
    unit: string;
    note?: string;
  }) => Promise<{ queuedOffline?: boolean } | void>;
  onDeleteMetric: (id: string) => Promise<void>;
  onCreatePersonalRecord: (input: {
    metricTypeKey: string;
    value: number;
    achievedAt: string;
    note?: string;
  }) => Promise<void>;
  onFlushPending?: () => Promise<void>;
};
