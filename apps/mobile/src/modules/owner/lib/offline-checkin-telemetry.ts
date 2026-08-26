import type { CheckinOfflineOpsTelemetry } from "@repo/api/checkin";

/** Best-effort ops payload for offline sync — counts/latency only, never codes or secrets. */
export function buildOfflineCheckinSyncOps(input: {
  queueDepth: number;
  syncLatencyMs: number;
  retryCount?: number;
}): CheckinOfflineOpsTelemetry {
  return {
    kind: "sync_batch",
    queueDepth: input.queueDepth,
    syncLatencyMs: input.syncLatencyMs,
    retryCount: input.retryCount ?? 0,
  };
}
