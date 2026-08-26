import type { HealthSyncProvider, UpsertHealthSyncStateInput } from "@repo/api";
import { accountProgress } from "@/shared/lib/api";

/**
 * Best-effort ops telemetry for health sync. Properties must never include
 * metric values, notes, or raw health payloads — only counts and reason codes.
 */
export async function reportHealthSyncOpsTelemetry(options: {
  provider: HealthSyncProvider;
  status: UpsertHealthSyncStateInput["status"];
  authorizedMetricKeys?: string[];
  cursorByMetric?: Record<string, string>;
  lastSyncAt?: string;
  lastErrorCode?: string | null;
  ops: NonNullable<UpsertHealthSyncStateInput["ops"]>;
}): Promise<void> {
  await accountProgress
    .upsertHealthSyncState(options.provider, {
      status: options.status,
      authorizedMetricKeys: options.authorizedMetricKeys,
      cursorByMetric: options.cursorByMetric,
      lastSyncAt: options.lastSyncAt,
      lastErrorCode: options.lastErrorCode,
      ops: options.ops,
    })
    .catch(() => undefined);
}
