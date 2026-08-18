export const UNIT_CHOICE_KEY_SUFFIX = '_unit';

export type UnitChoiceOption = {
  value: string;
  isActive?: boolean;
};

export function isUnitChoiceKey(key: string): boolean {
  return (
    key.endsWith(UNIT_CHOICE_KEY_SUFFIX) &&
    key.length > UNIT_CHOICE_KEY_SUFFIX.length
  );
}

export function firstActiveOptionValue(
  options: readonly UnitChoiceOption[],
): string | null {
  return options.find((option) => option.isActive !== false)?.value ?? null;
}

export function resolveStoredUnitValue(
  stored: string | undefined,
  options: readonly UnitChoiceOption[],
): string | null {
  const match = options.find((option) => option.value === stored);
  if (match && match.isActive !== false) return match.value;
  return firstActiveOptionValue(options);
}

export function unitsToPlain(
  units: Record<string, string> | Map<string, string> | undefined,
): Record<string, string> {
  if (!units) return {};
  if (units instanceof Map) return Object.fromEntries(units.entries());
  return { ...units };
}
