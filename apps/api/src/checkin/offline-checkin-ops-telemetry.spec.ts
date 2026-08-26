import { assertCheckinOfflineOpsHasNoPii, sanitizeCheckinOfflineOps } from './offline-checkin-ops-telemetry';

describe('offline check-in ops telemetry', () => {
  it('sanitizes allowed counters without raw identifiers', () => {
    expect(
      sanitizeCheckinOfflineOps({
        kind: 'sync_batch',
        clubId: '64b000000000000000000010',
        snapshotId: '64b000000000000000000011',
        deviceId: '64b000000000000000000012',
        queueDepth: 3,
        itemCount: 1,
        syncLatencyMs: 120,
        reasonCodes: ['authoritative_state_conflict'],
      }),
    ).toEqual({
      kind: 'sync_batch',
      clubId: '64b000000000000000000010',
      snapshotId: '64b000000000000000000011',
      deviceId: '64b000000000000000000012',
      queueDepth: 3,
      itemCount: 1,
      syncLatencyMs: 120,
      reasonCodes: ['authoritative_state_conflict'],
    });
  });

  it('rejects telemetry property keys that could carry secrets or QR payloads', () => {
    expect(() =>
      assertCheckinOfflineOpsHasNoPii({
        kind: 'sync_batch',
        bookingCode: 'G4M-1234',
      }),
    ).toThrow(/must not include bookingCode/i);
  });
});
