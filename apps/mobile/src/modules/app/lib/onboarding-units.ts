export type OnboardingWeightUnit = "kg" | "lbs";
export type OnboardingHeightUnit = "cm" | "ft";

export type OnboardingWeightUnitOption = {
  id: OnboardingWeightUnit;
  label: string;
};

export type OnboardingHeightUnitOption = {
  id: OnboardingHeightUnit;
  label: string;
};

const LBS_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

/** Map basics `weight_unit` choice values onto onboarding unit ids. */
export function normalizeWeightUnit(
  value: string,
): OnboardingWeightUnit | null {
  if (value === "kg") return "kg";
  if (value === "lb" || value === "lbs") return "lbs";
  return null;
}

/** Map basics `height_unit` choice values onto onboarding unit ids. */
export function normalizeHeightUnit(
  value: string,
): OnboardingHeightUnit | null {
  if (value === "cm") return "cm";
  if (value === "ft" || value === "ft_in" || value === "in") return "ft";
  return null;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * LBS_PER_KG);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / LBS_PER_KG);
}

export function cmToInches(cm: number): number {
  return Math.round(cm / CM_PER_IN);
}

export function inchesToCm(inches: number): number {
  return Math.round(inches * CM_PER_IN);
}

export function displayWeight(
  weightKg: number,
  unit: OnboardingWeightUnit,
): number {
  return unit === "kg" ? Math.round(weightKg) : kgToLbs(weightKg);
}

export function displayHeight(
  heightCm: number,
  unit: OnboardingHeightUnit,
): number {
  return unit === "cm" ? Math.round(heightCm) : cmToInches(heightCm);
}
