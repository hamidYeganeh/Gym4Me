import {
  firstActiveOptionValue,
  isUnitChoiceKey,
  resolveStoredUnitValue,
} from './profile-settings.util';

describe('isUnitChoiceKey', () => {
  it('accepts choice keys that end with _unit', () => {
    expect(isUnitChoiceKey('height_unit')).toBe(true);
    expect(isUnitChoiceKey('nutrition_unit')).toBe(true);
  });

  it('rejects unrelated choice keys', () => {
    expect(isUnitChoiceKey('gender')).toBe(false);
    expect(isUnitChoiceKey('_unit')).toBe(false);
    expect(isUnitChoiceKey('unit')).toBe(false);
  });
});

describe('resolveStoredUnitValue', () => {
  const options = [
    { value: 'kcal', isActive: true },
    { value: 'kj', isActive: false },
  ];

  it('keeps an active stored value', () => {
    expect(resolveStoredUnitValue('kcal', options)).toBe('kcal');
  });

  it('falls back when the stored option is disabled', () => {
    expect(resolveStoredUnitValue('kj', options)).toBe('kcal');
  });

  it('falls back when the stored option is unknown', () => {
    expect(resolveStoredUnitValue('missing', options)).toBe('kcal');
  });

  it('returns null when every option is disabled', () => {
    expect(firstActiveOptionValue([{ value: 'kj', isActive: false }])).toBe(
      null,
    );
    expect(
      resolveStoredUnitValue('kj', [{ value: 'kj', isActive: false }]),
    ).toBe(null);
  });
});
