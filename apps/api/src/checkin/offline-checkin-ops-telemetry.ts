import { AnalyticsEventName } from '../common/enums';
import type { EventWriterService } from '../analytics/event-writer.service';

export type CheckinOfflineOpsKind =
  | 'snapshot_issued'
  | 'sync_batch'
  | 'replay'
  | 'review'
  | 'reject'
  | 'retry'
  | 'revoke'
  | 'clock_skew';

export type CheckinOfflineOpsPayload = {
  kind: CheckinOfflineOpsKind;
  clubId: string;
  snapshotId?: string;
  deviceId?: string;
  queueDepth?: number;
  itemCount?: number;
  syncLatencyMs?: number;
  retryCount?: number;
  acceptedCount?: number;
  reviewCount?: number;
  rejectedCount?: number;
  duplicateCount?: number;
  reasonCodes?: string[];
  clockSkewMs?: number;
};

const FORBIDDEN_PROPERTY_KEYS = [
  'bookingcode',
  'booking_code',
  'qrcode',
  'qr',
  'secret',
  'token',
  'nonce',
  'devicekey',
  'payload',
] as const;

export function sanitizeCheckinOfflineOps(
  input: CheckinOfflineOpsPayload,
): CheckinOfflineOpsPayload {
  const sanitized: CheckinOfflineOpsPayload = { kind: input.kind, clubId: input.clubId };
  if (input.snapshotId) sanitized.snapshotId = input.snapshotId;
  if (input.deviceId) sanitized.deviceId = input.deviceId;
  if (input.queueDepth !== undefined) sanitized.queueDepth = input.queueDepth;
  if (input.itemCount !== undefined) sanitized.itemCount = input.itemCount;
  if (input.syncLatencyMs !== undefined) sanitized.syncLatencyMs = input.syncLatencyMs;
  if (input.retryCount !== undefined) sanitized.retryCount = input.retryCount;
  if (input.acceptedCount !== undefined) sanitized.acceptedCount = input.acceptedCount;
  if (input.reviewCount !== undefined) sanitized.reviewCount = input.reviewCount;
  if (input.rejectedCount !== undefined) sanitized.rejectedCount = input.rejectedCount;
  if (input.duplicateCount !== undefined) sanitized.duplicateCount = input.duplicateCount;
  if (input.clockSkewMs !== undefined) sanitized.clockSkewMs = input.clockSkewMs;
  if (input.reasonCodes?.length) {
    sanitized.reasonCodes = input.reasonCodes
      .map((code) => code.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return sanitized;
}

export function assertCheckinOfflineOpsHasNoPii(
  properties: Record<string, unknown>,
): void {
  for (const key of Object.keys(properties)) {
    const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (
      FORBIDDEN_PROPERTY_KEYS.some((forbidden) => normalized.includes(forbidden))
    ) {
      throw new Error(`Offline check-in ops telemetry must not include ${key}`);
    }
  }
}

export async function trackCheckinOfflineOps(
  events: EventWriterService,
  input: {
    actorId: string;
    eventId?: string;
    properties: CheckinOfflineOpsPayload;
  },
): Promise<void> {
  const properties = sanitizeCheckinOfflineOps(input.properties);
  assertCheckinOfflineOpsHasNoPii(properties as unknown as Record<string, unknown>);
  await events.track({
    eventId: input.eventId,
    eventName: AnalyticsEventName.CHECKIN_OFFLINE_OPS,
    actor: { userId: input.actorId },
    context: { clubId: properties.clubId },
    properties: properties as unknown as Record<string, unknown>,
  });
}
