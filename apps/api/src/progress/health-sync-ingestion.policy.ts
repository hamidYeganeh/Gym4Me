import {
  HealthSyncProvider,
  HealthSyncStatus,
  MetricSource,
} from '../common/enums';

export type HealthSyncAuthorizationState = {
  provider: HealthSyncProvider;
  status: HealthSyncStatus;
  authorizedMetricKeys: string[];
};

const SOURCE_PROVIDER: Partial<Record<MetricSource, HealthSyncProvider>> = {
  [MetricSource.APPLE_HEALTH]: HealthSyncProvider.APPLE_HEALTH,
  [MetricSource.HEALTH_CONNECT]: HealthSyncProvider.HEALTH_CONNECT,
};

const INGESTIBLE_STATUSES = new Set<HealthSyncStatus>([
  HealthSyncStatus.SYNCING,
]);

export function healthProviderForMetricSource(
  source: MetricSource,
): HealthSyncProvider | undefined {
  return SOURCE_PROVIDER[source];
}

export function healthSyncIngestionRejection(options: {
  source: MetricSource;
  metricKey: string;
  states: ReadonlyMap<HealthSyncProvider, HealthSyncAuthorizationState>;
}): string | null {
  const provider = healthProviderForMetricSource(options.source);
  if (!provider) return null;

  const state = options.states.get(provider);
  if (!state || !INGESTIBLE_STATUSES.has(state.status)) {
    return 'health_sync_connection_not_active';
  }
  if (!state.authorizedMetricKeys.includes(options.metricKey.trim())) {
    return 'health_sync_metric_scope_not_authorized';
  }
  return null;
}
