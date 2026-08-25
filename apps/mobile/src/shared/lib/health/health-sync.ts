import type {
  HealthSyncProvider,
  SyncProgressMetricInput,
} from "@repo/api";
import { accountProgress } from "@/shared/lib/api";
import { loadHealthPlugin, normalizePlatform } from "./health-metrics";
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

export type HealthSampleReadMode = "plugin";

export const HEALTH_SYNC_OVERLAP_MS = 5 * 60 * 1000;
const HEALTH_SYNC_DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

export class HealthSyncError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "HealthSyncError";
  }
}

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
  return [
    ...new Set(
      (authorization?.readAuthorized ?? []).map(
        (type) => HEALTH_TYPE_TO_METRIC_KEY[type],
      ),
    ),
  ];
}

export function authorizedHealthTypesFromAuth(
  authorization: HealthMetricsAuthorization | null,
): HealthMetricsDataType[] {
  return [...new Set(authorization?.readAuthorized ?? [])];
}

export function overlapStartDate(
  cursor: string | undefined,
  fallbackStartDate: string,
): string {
  if (!cursor) return fallbackStartDate;
  const cursorTime = Date.parse(cursor);
  if (!Number.isFinite(cursorTime)) return fallbackStartDate;
  return new Date(cursorTime - HEALTH_SYNC_OVERLAP_MS).toISOString();
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

export async function readHealthSamples(options: {
  provider: HealthSyncProvider;
  types: HealthMetricsDataType[];
  startDate?: string;
  endDate?: string;
  limitPerType?: number;
  cursorByMetric?: Record<string, string>;
}): Promise<{
  mode: HealthSampleReadMode;
  platform: HealthMetricsPlatform;
  entries: SyncProgressMetricInput[];
  provider: HealthSyncProvider;
}> {
  const types = options.types;
  const endDate = options.endDate ?? new Date().toISOString();
  const startDate =
    options.startDate ??
    new Date(Date.now() - HEALTH_SYNC_DEFAULT_LOOKBACK_MS).toISOString();
  const limit = options.limitPerType ?? 100;

  try {
    const { Capacitor, Health } = await loadHealthPlugin();
    if (!Capacitor.isNativePlatform()) {
      throw new HealthSyncError(
        "health_sync_not_native",
        "Health sync is only available on a native installation.",
      );
    }

    const availability = await Health.isAvailable();
    const platform = normalizePlatform(availability.platform);
    const provider = providerForPlatform(platform);
    if (!availability.available || !provider) {
      throw new HealthSyncError(
        "health_sync_unavailable",
        "The device health provider is unavailable.",
      );
    }
    if (provider !== options.provider) {
      throw new HealthSyncError(
        "health_sync_provider_mismatch",
        "The connected provider does not match this device platform.",
      );
    }

    if (typeof Health.readSamples !== "function") {
      throw new HealthSyncError(
        "health_sync_read_unsupported",
        "The installed health provider cannot read samples.",
      );
    }

    const entries: SyncProgressMetricInput[] = [];
    for (const dataType of types) {
      const metricKey = HEALTH_TYPE_TO_METRIC_KEY[dataType];
      const typeStartDate = overlapStartDate(
        options.cursorByMetric?.[metricKey],
        startDate,
      );
      const { samples } = await Health.readSamples({
        dataType,
        startDate: typeStartDate,
        endDate,
        limit,
        ascending: true,
      });
      for (const sample of samples) {
        entries.push({
          metricKey,
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
  } catch (error) {
    if (error instanceof HealthSyncError) throw error;
    throw new HealthSyncError(
      "health_sync_read_failed",
      "Reading health samples failed.",
      { cause: error },
    );
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
    cursorByMetric: options.cursorByMetric,
    lastSyncAt: options.lastSyncAt,
    lastErrorCode: null,
  });
}

export async function disconnectHealthProvider(provider: HealthSyncProvider) {
  // Disconnect does NOT delete prior samples — only flips sync status.
  return accountProgress.upsertHealthSyncState(provider, {
    status: "disconnected",
    authorizedMetricKeys: [],
    cursorByMetric: {},
    lastErrorCode: null,
  });
}

function errorCode(error: unknown, fallback: string): string {
  return error instanceof HealthSyncError ? error.code : fallback;
}

async function markHealthSyncError(
  provider: HealthSyncProvider,
  error: unknown,
  fallbackCode: string,
) {
  await accountProgress
    .upsertHealthSyncState(provider, {
      status: "error",
      lastErrorCode: errorCode(error, fallbackCode),
    })
    .catch(() => undefined);
}

async function markHealthSyncPartial(provider: HealthSyncProvider) {
  await accountProgress.upsertHealthSyncState(provider, {
    status: "partial",
    lastErrorCode: "health_sync_partial_rejection",
  });
}

export async function flushHealthSamples(options: {
  provider: HealthSyncProvider;
  authorization: HealthMetricsAuthorization;
  cursorByMetric?: Record<string, string>;
  startDate?: string;
  endDate?: string;
}): Promise<HealthSyncFlushResult> {
  const types = authorizedHealthTypesFromAuth(options.authorization);
  const authorizedMetricKeys = authorizedMetricKeysFromAuth(
    options.authorization,
  );
  if (types.length === 0) {
    const error = new HealthSyncError(
      "health_sync_no_permission",
      "No health metric has read permission.",
    );
    await markHealthSyncError(options.provider, error, error.code);
    throw error;
  }

  await accountProgress.upsertHealthSyncState(options.provider, {
    status: "syncing",
    authorizedMetricKeys,
    lastErrorCode: null,
  });

  let read: Awaited<ReturnType<typeof readHealthSamples>>;
  try {
    read = await readHealthSamples({
      provider: options.provider,
      types,
      cursorByMetric: options.cursorByMetric,
      startDate: options.startDate,
      endDate: options.endDate,
    });
  } catch (error) {
    await markHealthSyncError(
      options.provider,
      error,
      "health_sync_read_failed",
    );
    throw error;
  }

  const now = new Date().toISOString();
  const cursorByMetric: Record<string, string> = {
    ...(options.cursorByMetric ?? {}),
  };
  for (const entry of read.entries) {
    const previous = cursorByMetric[entry.metricKey];
    if (!previous || Date.parse(entry.recordedAt) > Date.parse(previous)) {
      cursorByMetric[entry.metricKey] = entry.recordedAt;
    }
  }

  if (read.entries.length > 0) {
    let result: Awaited<ReturnType<typeof accountProgress.syncMetrics>>;
    try {
      result = await accountProgress.syncMetrics({
        entries: read.entries,
      });
    } catch (error) {
      await markHealthSyncError(
        read.provider,
        error,
        "health_sync_upload_failed",
      );
      throw error;
    }

    if (result.rejected.length > 0) {
      await markHealthSyncPartial(read.provider);
      return {
        provider: read.provider,
        mode: read.mode,
        sampleCount: read.entries.length,
        created: result.created,
        deduplicated: result.deduplicated,
        rejected: result.rejected.length,
      };
    }

    await accountProgress.upsertHealthSyncState(read.provider, {
      status: "synced",
      authorizedMetricKeys,
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

  // A successful native read may legitimately return no new samples.
  await accountProgress.upsertHealthSyncState(read.provider, {
    status: "synced",
    authorizedMetricKeys,
    cursorByMetric,
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
