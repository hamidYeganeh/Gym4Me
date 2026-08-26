export class OfflineCheckinTestFailureError extends Error {
  constructor(public readonly point: string) {
    super(`Offline check-in test failure: ${point}`);
    this.name = 'OfflineCheckinTestFailureError';
  }
}

/** Disabled in production. Comma-separated points from OFFLINE_CHECKIN_TEST_FAILURES. */
export function throwIfOfflineCheckinTestFailure(
  point: string,
  nodeEnv: string | undefined,
): void {
  if (nodeEnv === 'production') return;
  const raw = process.env.OFFLINE_CHECKIN_TEST_FAILURES;
  if (!raw) return;
  const points = raw.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (points.includes(point)) {
    throw new OfflineCheckinTestFailureError(point);
  }
}
