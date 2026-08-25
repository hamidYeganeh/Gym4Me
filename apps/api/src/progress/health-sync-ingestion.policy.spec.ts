import {
  HealthSyncProvider,
  HealthSyncStatus,
  MetricSource,
} from '../common/enums';
import {
  healthSyncIngestionRejection,
  type HealthSyncAuthorizationState,
} from './health-sync-ingestion.policy';

function states(
  status: HealthSyncStatus,
  authorizedMetricKeys = ['steps'],
): Map<HealthSyncProvider, HealthSyncAuthorizationState> {
  return new Map([
    [
      HealthSyncProvider.APPLE_HEALTH,
      {
        provider: HealthSyncProvider.APPLE_HEALTH,
        status,
        authorizedMetricKeys,
      },
    ],
  ]);
}

describe('healthSyncIngestionRejection', () => {
  it('allows manual metrics without a provider state', () => {
    expect(
      healthSyncIngestionRejection({
        source: MetricSource.MANUAL,
        metricKey: 'water_ml',
        states: new Map(),
      }),
    ).toBeNull();
  });

  it('requires an active matching provider and explicit metric scope', () => {
    expect(
      healthSyncIngestionRejection({
        source: MetricSource.APPLE_HEALTH,
        metricKey: 'steps',
        states: states(HealthSyncStatus.SYNCING),
      }),
    ).toBeNull();
    expect(
      healthSyncIngestionRejection({
        source: MetricSource.APPLE_HEALTH,
        metricKey: 'heart_rate_bpm',
        states: states(HealthSyncStatus.SYNCING),
      }),
    ).toBe('health_sync_metric_scope_not_authorized');
  });

  it.each([
    HealthSyncStatus.CONNECTED,
    HealthSyncStatus.SYNCED,
    HealthSyncStatus.PARTIAL,
    HealthSyncStatus.ERROR,
    HealthSyncStatus.DISCONNECTED,
    HealthSyncStatus.PAUSED,
  ])('rejects ingestion while provider is %s', (status) => {
    expect(
      healthSyncIngestionRejection({
        source: MetricSource.APPLE_HEALTH,
        metricKey: 'steps',
        states: states(status),
      }),
    ).toBe('health_sync_connection_not_active');
  });
});
