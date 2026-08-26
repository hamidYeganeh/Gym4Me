import { OfflineCheckinTestFailureError, throwIfOfflineCheckinTestFailure } from './offline-checkin-test-failures';

describe('offline check-in test failures', () => {
  const original = process.env.OFFLINE_CHECKIN_TEST_FAILURES;

  afterEach(() => {
    process.env.OFFLINE_CHECKIN_TEST_FAILURES = original;
  });

  it('is disabled in production', () => {
    process.env.OFFLINE_CHECKIN_TEST_FAILURES = 'sync_after_commit';
    expect(() =>
      throwIfOfflineCheckinTestFailure('sync_after_commit', 'production'),
    ).not.toThrow();
  });

  it('throws for configured points outside production', () => {
    process.env.OFFLINE_CHECKIN_TEST_FAILURES = 'sync_after_commit,sync_before_response';
    expect(() =>
      throwIfOfflineCheckinTestFailure('sync_after_commit', 'test'),
    ).toThrow(OfflineCheckinTestFailureError);
  });
});
