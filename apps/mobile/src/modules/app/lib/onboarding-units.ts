export type OnboardingWeightUnit = "kg" | "lbs";
export type OnboardingHeightUnit = "cm" | "ft";

const LBS_PER_KG = 2.2046226218;
const CM_PER_IN = 2.54;

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
