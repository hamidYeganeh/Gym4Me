import { AthleteDataGrantScope } from '../common/enums';
import {
  grantAllowsScope,
  metricKeysAllowedByGrant,
} from './data-grant.policy';

describe('data grant policy', () => {
  it('does not expand a partial health permission', () => {
    expect(
      metricKeysAllowedByGrant([AthleteDataGrantScope.METRICS_SLEEP]),
    ).toEqual(['sleep_duration_min', 'sleep_quality', 'sleep']);
  });

  it('combines explicit scopes without adding unrelated metrics', () => {
    expect(
      metricKeysAllowedByGrant([
        AthleteDataGrantScope.METRICS_WEIGHT,
        AthleteDataGrantScope.METRICS_WATER,
      ]),
    ).toEqual(['weight_kg', 'water_ml', 'hydration']);
  });

  it('returns no metrics after a grant is revoked or has no metric scopes', () => {
    expect(metricKeysAllowedByGrant([])).toEqual([]);
    expect(
      metricKeysAllowedByGrant([AthleteDataGrantScope.WORKOUTS_LOGS]),
    ).toEqual([]);
  });

  it('uses the server active catalog for metrics.* and removes duplicates', () => {
    expect(
      metricKeysAllowedByGrant(
        [AthleteDataGrantScope.METRICS_ALL],
        ['weight_kg', 'custom_metric', 'weight_kg'],
      ),
    ).toEqual(['weight_kg', 'custom_metric']);
  });

  it('requires the exact non-metric scope', () => {
    const scopes = [AthleteDataGrantScope.PROGRESS_PHOTOS];

    expect(
      grantAllowsScope(scopes, AthleteDataGrantScope.PROGRESS_PHOTOS),
    ).toBe(true);
    expect(grantAllowsScope(scopes, AthleteDataGrantScope.WORKOUTS_LOGS)).toBe(
      false,
    );
  });
});
