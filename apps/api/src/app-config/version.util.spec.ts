import { compareAppVersions, rolloutBucket } from './version.util';

describe('app version utilities', () => {
  it('compares semantic app versions numerically', () => {
    expect(compareAppVersions('1.10.0', '1.9.9')).toBe(1);
    expect(compareAppVersions('2.0.0', '2.0.0')).toBe(0);
    expect(compareAppVersions('0.9.9', '1.0.0')).toBe(-1);
  });

  it('ignores build and prerelease labels for compatibility checks', () => {
    expect(compareAppVersions('1.2.3-beta.2', '1.2.3')).toBe(0);
    expect(compareAppVersions('1.2.3+45', '1.2.3')).toBe(0);
  });

  it('creates a stable percentage bucket', () => {
    const bucket = rolloutBucket('feature:installation');
    expect(bucket).toBe(rolloutBucket('feature:installation'));
    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(100);
  });
});
