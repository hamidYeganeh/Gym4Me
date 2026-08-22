import { AthleteDataGrantScope } from '../common/enums';

const METRIC_KEY_GRANT_SCOPES: Readonly<
  Record<string, readonly AthleteDataGrantScope[]>
> = {
  weight_kg: [AthleteDataGrantScope.METRICS_WEIGHT],
  sleep_duration_min: [AthleteDataGrantScope.METRICS_SLEEP],
  sleep_quality: [AthleteDataGrantScope.METRICS_SLEEP],
  sleep: [AthleteDataGrantScope.METRICS_SLEEP],
  steps: [AthleteDataGrantScope.METRICS_STEPS],
  water_ml: [AthleteDataGrantScope.METRICS_WATER],
  hydration: [AthleteDataGrantScope.METRICS_WATER],
  walking_distance_km: [AthleteDataGrantScope.METRICS_WALKING],
  walking_duration_min: [AthleteDataGrantScope.METRICS_WALKING],
};

export function grantAllowsScope(
  scopes: readonly AthleteDataGrantScope[],
  required: AthleteDataGrantScope,
): boolean {
  return scopes.includes(required);
}

/** Resolve exactly which metric keys a coach may read from an active grant. */
export function metricKeysAllowedByGrant(
  scopes: readonly AthleteDataGrantScope[],
  allActiveMetricKeys: readonly string[] = [],
): string[] {
  if (scopes.includes(AthleteDataGrantScope.METRICS_ALL)) {
    return [...new Set(allActiveMetricKeys)];
  }

  return Object.entries(METRIC_KEY_GRANT_SCOPES)
    .filter(([, requiredScopes]) =>
      requiredScopes.some((scope) => scopes.includes(scope)),
    )
    .map(([key]) => key);
}
