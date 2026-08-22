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
      35,
    );
    expect(DEFAULT_REFS[RefType.GOAL_TYPE].length).toBeGreaterThanOrEqual(15);
    expect(DEFAULT_REFS[RefType.COACH_SPECIALTY].length).toBeGreaterThanOrEqual(
      25,
    );
    expect(
      DEFAULT_REFS[RefType.REVIEW_CRITERION].length,
    ).toBeGreaterThanOrEqual(10);
  });

  it('includes Iran-market venue types in the club category catalog', () => {
    const slugs = DEFAULT_REFS[RefType.CLUB_CATEGORY].map((item) => item.slug);

    expect(slugs).toEqual(
      expect.arrayContaining([
        'zurkhaneh',
        'wrestling-club',
        'dance-studio',
        'gymnastics-academy',
        'weightlifting-club',
        'functional-studio',
        'padel-club',
        'squash-club',
        'volleyball-hall',
        'basketball-court',
        'bowling-alley',
        'ice-rink',
        'spa-wellness',
        'golf-club',
      ]),
    );
  });
});
