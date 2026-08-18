import type { ChoiceOption, PublicChoiceGroup } from "@repo/api";

export const UNIT_CHOICE_KEY_SUFFIX = "_unit";

export const UNIT_ICON_KEYS = [
  "distance",
  "speed",
  "height",
  "weight",
  "blood_pressure",
  "nutrition",
  "calorie",
  "glucose",
] as const;

export type UnitIconKey = (typeof UNIT_ICON_KEYS)[number];

const PREFERRED_UNIT_ORDER = [
  "distance_unit",
  "speed_unit",
  "height_unit",
  "weight_unit",
  "blood_pressure_unit",
  "nutrition_unit",
  "calorie_unit",
  "glucose_unit",
] as const;

export function unitIconKey(choiceKey: string): UnitIconKey | null {
  const stem = choiceKey.endsWith(UNIT_CHOICE_KEY_SUFFIX)
    ? choiceKey.slice(0, -UNIT_CHOICE_KEY_SUFFIX.length)
    : choiceKey;
  return UNIT_ICON_KEYS.includes(stem as UnitIconKey)
    ? (stem as UnitIconKey)
    : null;
}

export function sortUnitChoiceGroups(
  groups: readonly PublicChoiceGroup[],
): PublicChoiceGroup[] {
  const rank = new Map(PREFERRED_UNIT_ORDER.map((key, index) => [key, index]));
  return [...groups].sort((a, b) => {
    const aRank = rank.get(a.value as (typeof PREFERRED_UNIT_ORDER)[number]);
    const bRank = rank.get(b.value as (typeof PREFERRED_UNIT_ORDER)[number]);
    if (aRank != null && bRank != null) return aRank - bRank;
    if (aRank != null) return -1;
    if (bRank != null) return 1;
    return a.value.localeCompare(b.value);
  });
}

export function optionLabel(
  options: readonly ChoiceOption[],
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.name ?? null;
}

export function hasActiveUnitOption(
  options: readonly ChoiceOption[],
): boolean {
  return options.some((option) => option.isActive !== false);
}

export function firstActiveUnitValue(
  options: readonly ChoiceOption[],
): string | null {
  return options.find((option) => option.isActive !== false)?.value ?? null;
}

export function resolveUnitValue(
  stored: string | null | undefined,
  options: readonly ChoiceOption[],
): string | null {
  const match = options.find((option) => option.value === stored);
  if (match && match.isActive !== false) return match.value;
  return firstActiveUnitValue(options);
}

export const UNIT_CARD_SKELETON_COUNT = PREFERRED_UNIT_ORDER.length;
