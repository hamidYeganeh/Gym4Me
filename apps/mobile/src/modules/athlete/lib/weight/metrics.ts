export const SUPPORTED_METRICS = ["weight"] as const;

export type MetricSlug = (typeof SUPPORTED_METRICS)[number];

export function normalizeMetricSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function isSupportedMetric(value: string): value is MetricSlug {
  return (SUPPORTED_METRICS as readonly string[]).includes(
    normalizeMetricSlug(value),
  );
}
