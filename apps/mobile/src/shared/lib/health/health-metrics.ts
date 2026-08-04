import type {
  HealthMetricsAuthorization,
  HealthMetricsDataType,
  HealthMetricsPlatform,
} from "./health-metrics.types";

/** Default read scopes for athlete fitness metrics + watch-synced vitals. */
export const DEFAULT_HEALTH_READ_TYPES: HealthMetricsDataType[] = [
  "steps",
  "distance",
  "calories",
  "heartRate",
  "weight",
];

export const DEFAULT_HEALTH_WRITE_TYPES: HealthMetricsDataType[] = ["weight"];

export function emptyAuthorization(): HealthMetricsAuthorization {
  return {
    readAuthorized: [],
    readDenied: [],
    writeAuthorized: [],
    writeDenied: [],
  };
}

export function hasAnyReadAccess(
  authorization: HealthMetricsAuthorization | null,
): boolean {
  return (authorization?.readAuthorized.length ?? 0) > 0;
}

export function normalizePlatform(
  value: string | undefined,
): HealthMetricsPlatform {
  if (value === "ios" || value === "android" || value === "web") {
    return value;
  }
  return "unknown";
}

export async function loadHealthPlugin() {
  const [{ Capacitor }, { Health }] = await Promise.all([
    import("@capacitor/core"),
    import("@capgo/capacitor-health"),
  ]);

  return { Capacitor, Health };
}
