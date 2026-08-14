import type {
  HealthSyncProvider,
  SyncProgressMetricInput,
} from "@repo/api";
import { accountProgress } from "@/shared/lib/api";
import {
  DEFAULT_HEALTH_READ_TYPES,
  loadHealthPlugin,
  normalizePlatform,
} from "./health-metrics";
import type {
  HealthMetricsAuthorization,
  HealthMetricsDataType,
  HealthMetricsPlatform,
} from "./health-metrics.types";

/**
 * Maps Capgo health data types → Gym4Me metric keys used by ProgressMetric.
 * Units are normalized where the plugin differs (distance meters → km).
 */
export const HEALTH_TYPE_TO_METRIC_KEY: Record<HealthMetricsDataType, string> =
  {
    steps: "steps",
    distance: "walking_distance_km",
    calories: "calories_kcal",
    heartRate: "heart_rate_bpm",
    weight: "weight_kg",
  };

export const HEALTH_TYPE_TO_UNIT: Record<HealthMetricsDataType, string> = {
  steps: "steps",
  distance: "km",
  calories: "kcal",
  heartRate: "bpm",
  weight: "kg",
};

/**
 * Capgo `readSamples` is available on native builds. On web / when samples
 * cannot be read, sync still advances `lastSyncAt` / cursor via upsert so the
 * manual-only path stays healthy (stub empty flush).
 */
export type HealthSampleReadMode = "plugin" | "stub_empty";

export type HealthSyncFlushResult = {
  provider: HealthSyncProvider;
  mode: HealthSampleReadMode;
  sampleCount: number;
  created: number;
  deduplicated: number;
  rejected: number;
};

function providerForPlatform(
  platform: HealthMetricsPlatform,
): HealthSyncProvider | null {
  if (platform === "ios") return "apple_health";
  if (platform === "android") return "health_connect";
  return null;
}

export function resolveHealthProvider(
  platform: HealthMetricsPlatform,
): HealthSyncProvider | null {
  return providerForPlatform(platform);
}

export function authorizedMetricKeysFromAuth(
  authorization: HealthMetricsAuthorization | null,
): string[] {
  return (authorization?.readAuthorized ?? []).map(
    (type) => HEALTH_TYPE_TO_METRIC_KEY[type],
  );
}

function normalizeSampleValue(
  dataType: HealthMetricsDataType,
  value: number,
): number {
  if (dataType === "distance") {
    // Plugin returns meters; Gym4Me stores km.
    return value / 1000;
  }
  return value;
}

function sampleSourceRecordId(sample: {
  dataType: string;
  startDate: string;
  endDate: string;
  sourceId?: string;
  value: number;
}): string {
  return [
    sample.dataType,
    sample.startDate,
    sample.endDate,
    sample.sourceId ?? "unknown",
    String(sample.value),
  ].join("|");
}

/**
 * Reads samples from Capgo Health when available; otherwise returns an empty
 * list and `stub_empty` mode (cursor/lastSyncAt still updated by caller).
 */
export async function readHealthSamples(options: {
  types?: HealthMetricsDataType[];
  startDate?: string;
  endDate?: string;
  limitPerType?: number;
}): Promise<{
  mode: HealthSampleReadMode;
  platform: HealthMetricsPlatform;
  entries: SyncProgressMetricInput[];
  provider: HealthSyncProvider | null;
}> {
  const types = options.types ?? DEFAULT_HEALTH_READ_TYPES;
  const endDate = options.endDate ?? new Date().toISOString();
  const startDate =
    options.startDate ??
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const limit = options.limitPerType ?? 100;

  try {
    const { Capacitor, Health } = await loadHealthPlugin();
    if (!Capacitor.isNativePlatform()) {
      return {
        mode: "stub_empty",
        platform: "web",
        entries: [],
        provider: null,
      };
    }

    const availability = await Health.isAvailable();
    const platform = normalizePlatform(availability.platform);
    const provider = providerForPlatform(platform);
    if (!availability.available || !provider) {
      return { mode: "stub_empty", platform, entries: [], provider };
    }

    if (typeof Health.readSamples !== "function") {
      // Documented stub: plugin present but readSamples unavailable.
      return { mode: "stub_empty", platform, entries: [], provider };
    }

    const entries: SyncProgressMetricInput[] = [];
    for (const dataType of types) {
      const { samples } = await Health.readSamples({
        dataType,
        startDate,
        endDate,
        limit,
        ascending: true,
      });
      for (const sample of samples) {
        entries.push({
          metricKey: HEALTH_TYPE_TO_METRIC_KEY[dataType],
          value: normalizeSampleValue(dataType, sample.value),
          unit: HEALTH_TYPE_TO_UNIT[dataType],
          recordedAt: sample.endDate || sample.startDate,
          source: provider,
          sourceRecordId: sampleSourceRecordId(sample),
          period:
            dataType === "steps" || dataType === "distance"
              ? {
                  start: sample.startDate,
                  end: sample.endDate,
                }
              : undefined,
        });
      }
    }

    return { mode: "plugin", platform, entries, provider };
  } catch {
    return {
      mode: "stub_empty",
      platform: "unknown",
      entries: [],
      provider: null,
    };
  }
}

export async function upsertConnectedHealthState(options: {
  provider: HealthSyncProvider;
  authorization: HealthMetricsAuthorization;
  cursorByMetric?: Record<string, string>;
  lastSyncAt?: string;
}) {
  return accountProgress.upsertHealthSyncState(options.provider, {
    status: "connected",
    authorizedMetricKeys: authorizedMetricKeysFromAuth(options.authorization),
    cursorByMetric: options.cursorByMetric ?? {},
    lastSyncAt: options.lastSyncAt,
    lastErrorCode: null,
  });
}

export async function disconnectHealthProvider(provider: HealthSyncProvider) {
  // Disconnect does NOT delete prior samples — only flips sync status.
  return accountProgress.upsertHealthSyncState(provider, {
    status: "disconnected",
    lastErrorCode: null,
  });
}

export async function flushHealthSamples(options?: {
  types?: HealthMetricsDataType[];
  startDate?: string;
  endDate?: string;
}): Promise<HealthSyncFlushResult | null> {
  const read = await readHealthSamples(options ?? {});
  if (!read.provider) return null;

  const now = new Date().toISOString();
  const cursorByMetric: Record<string, string> = {};
  for (const entry of read.entries) {
    cursorByMetric[entry.metricKey] = entry.recordedAt;
  }

  if (read.entries.length > 0) {
    const result = await accountProgress.syncMetrics({
      entries: read.entries,
    });
    await accountProgress.upsertHealthSyncState(read.provider, {
      status: "connected",
      authorizedMetricKeys: Object.values(HEALTH_TYPE_TO_METRIC_KEY),
      cursorByMetric,
      lastSyncAt: now,
      lastErrorCode: null,
    });
    return {
      provider: read.provider,
      mode: read.mode,
      sampleCount: read.entries.length,
      created: result.created,
      deduplicated: result.deduplicated,
      rejected: result.rejected.length,
    };
  }

  // Stub / empty path: still advance cursor + lastSyncAt.
  await accountProgress.upsertHealthSyncState(read.provider, {
    status: "connected",
    authorizedMetricKeys: Object.values(HEALTH_TYPE_TO_METRIC_KEY),
    cursorByMetric: {},
    lastSyncAt: now,
    lastErrorCode: null,
  });

  return {
    provider: read.provider,
    mode: read.mode,
    sampleCount: 0,
    created: 0,
    deduplicated: 0,
    rejected: 0,
  };
}
