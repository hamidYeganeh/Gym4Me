import type { HealthSyncProvider, HealthSyncState } from "@repo/api";
import type {
  HealthMetricsConnectStatus,
  HealthMetricsPlatform,
} from "@/shared/lib/health";

export type AthleteHealthSyncScreenProps = {
  syncStates: HealthSyncState[];
  connectStatus: HealthMetricsConnectStatus;
  platform: HealthMetricsPlatform;
  pending?: boolean;
  lastFlushSummary?: string | null;
  onConnect: () => Promise<void>;
  onSync: () => Promise<void>;
  onDisconnect: (provider: HealthSyncProvider) => Promise<void>;
  onOpenSettings?: () => Promise<void>;
};
