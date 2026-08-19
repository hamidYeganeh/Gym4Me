import { DEFAULT_CHOICE_GROUPS } from './choice-defaults';

describe('DEFAULT_CHOICE_GROUPS', () => {
  it('has unique keys and unique option values per group', () => {
    const keys = DEFAULT_CHOICE_GROUPS.map((group) => group.key);
    expect(new Set(keys).size).toBe(keys.length);

    for (const group of DEFAULT_CHOICE_GROUPS) {
      const values = group.options.map((option) => option.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('marks app-contract groups as system', () => {
    const systemKeys = DEFAULT_CHOICE_GROUPS.filter((group) => group.isSystem).map(
      (group) => group.key,
    );
    expect(systemKeys).toEqual(
      expect.arrayContaining([
        'gender',
        'onboarding_goal',
        'athlete_level',
        'athlete_diet',
        'nutrition_category',
      ]),
    );
  });
});
