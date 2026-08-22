import { RefType } from '../../common/enums';
import { DEFAULT_REFS } from './ref-defaults';

describe('DEFAULT_REFS', () => {
  it('has unique slugs and deterministic order within every type', () => {
    for (const type of Object.values(RefType)) {
      const items = DEFAULT_REFS[type];
      expect(items.length).toBeGreaterThan(0);
      expect(new Set(items.map((item) => item.slug)).size).toBe(items.length);
      expect(items.map((item) => item.order)).toEqual(
        items.map((_, index) => index),
      );
    }
  });

  it('provides useful launch coverage for admin-managed catalogs', () => {
    expect(DEFAULT_REFS[RefType.EQUIPMENT].length).toBeGreaterThanOrEqual(50);
    expect(DEFAULT_REFS[RefType.AMENITY].length).toBeGreaterThanOrEqual(30);
    expect(DEFAULT_REFS[RefType.CLUB_CATEGORY].length).toBeGreaterThanOrEqual(
      20,
    );
    expect(DEFAULT_REFS[RefType.GOAL_TYPE].length).toBeGreaterThanOrEqual(15);
    expect(DEFAULT_REFS[RefType.COACH_SPECIALTY].length).toBeGreaterThanOrEqual(
      25,
    );
    expect(
      DEFAULT_REFS[RefType.REVIEW_CRITERION].length,
    ).toBeGreaterThanOrEqual(10);
  });
});
