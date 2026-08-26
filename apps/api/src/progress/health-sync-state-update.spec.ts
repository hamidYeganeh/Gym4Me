import 'reflect-metadata';
import { HealthSyncProvider, HealthSyncStatus } from '../common/enums';
import { validate } from 'class-validator';
import { UpsertHealthSyncStateDto, HealthSyncOpsTelemetryDto } from './dto/progress.dto';
import { buildHealthSyncStateUpdate } from './health-sync-state-update';

const userId = '665f0a1b2c3d4e5f67890101';

describe('buildHealthSyncStateUpdate', () => {
  it('preserves omitted permissions, cursor and last successful sync on errors', () => {
    const update = buildHealthSyncStateUpdate({
      provider: HealthSyncProvider.APPLE_HEALTH,
      userId,
      dto: {
        status: HealthSyncStatus.ERROR,
        lastErrorCode: ' health_sync_read_failed ',
      },
    });

    expect(update).toMatchObject({
      $set: {
        status: HealthSyncStatus.ERROR,
        lastErrorCode: 'health_sync_read_failed',
      },
      $setOnInsert: {
        provider: HealthSyncProvider.APPLE_HEALTH,
        authorizedMetricKeys: [],
        cursorByMetric: {},
      },
    });
    expect(update).not.toHaveProperty('$set.authorizedMetricKeys');
    expect(update).not.toHaveProperty('$set.cursorByMetric');
    expect(update).not.toHaveProperty('$set.lastSyncAt');
  });

  it('sets successful sync fields and clears the prior error atomically', () => {
    const update = buildHealthSyncStateUpdate({
      provider: HealthSyncProvider.HEALTH_CONNECT,
      userId,
      dto: {
        status: HealthSyncStatus.CONNECTED,
        authorizedMetricKeys: ['steps'],
        cursorByMetric: { steps: '2026-08-24T10:00:00.000Z' },
        lastSyncAt: '2026-08-24T10:05:00.000Z',
        lastErrorCode: null,
      },
    });

    expect(update).toMatchObject({
      $set: {
        status: HealthSyncStatus.CONNECTED,
        authorizedMetricKeys: ['steps'],
        cursorByMetric: { steps: '2026-08-24T10:00:00.000Z' },
        lastSyncAt: new Date('2026-08-24T10:05:00.000Z'),
      },
      $unset: { lastErrorCode: 1 },
    });
    expect(update).not.toHaveProperty('$setOnInsert.authorizedMetricKeys');
    expect(update).not.toHaveProperty('$setOnInsert.cursorByMetric');
  });

  it('deduplicates repeated authorized metric keys before persistence', () => {
    const update = buildHealthSyncStateUpdate({
      provider: HealthSyncProvider.APPLE_HEALTH,
      userId,
      dto: {
        status: HealthSyncStatus.CONNECTED,
        authorizedMetricKeys: ['steps', 'steps'],
      },
    });

    expect(update).toHaveProperty('$set.authorizedMetricKeys', ['steps']);
  });

  it('clears granted scopes and cursors when disconnected', () => {
    const update = buildHealthSyncStateUpdate({
      provider: HealthSyncProvider.APPLE_HEALTH,
      userId,
      dto: {
        status: HealthSyncStatus.DISCONNECTED,
        lastErrorCode: null,
      },
    });

    expect(update).toMatchObject({
      $set: {
        status: HealthSyncStatus.DISCONNECTED,
        authorizedMetricKeys: [],
        cursorByMetric: {},
      },
      $unset: { lastErrorCode: 1 },
    });
  });

  it('rejects metric scopes that are not installed health-sync types', async () => {
    const dto = Object.assign(new UpsertHealthSyncStateDto(), {
      status: HealthSyncStatus.CONNECTED,
      authorizedMetricKeys: ['medical_records'],
    });

    const errors = await validate(dto);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'authorizedMetricKeys' }),
      ]),
    );
  });

  it('accepts ops telemetry without persisting it into the state update', async () => {
    const ops = Object.assign(new HealthSyncOpsTelemetryDto(), {
      kind: 'queue_flush' as const,
      queueDepth: 2,
      syncLatencyMs: 120,
      rejectedReasons: ['health_sync_metric_scope_not_authorized'],
    });
    const dto = Object.assign(new UpsertHealthSyncStateDto(), {
      status: HealthSyncStatus.SYNCED,
      ops,
    });

    expect(await validate(dto)).toEqual([]);

    const update = buildHealthSyncStateUpdate({
      provider: HealthSyncProvider.APPLE_HEALTH,
      userId,
      dto,
    });

    expect(JSON.stringify(update)).not.toContain('queueDepth');
    expect(JSON.stringify(update)).not.toContain('rejectedReasons');
  });
});
