import type { OnboardingWeightUnit } from "@/modules/app/lib/onboarding-units";

export type OnboardingWeightSectionProps = {
  label: string;
  unit: OnboardingWeightUnit;
  weightKg: number;
  unitKgLabel: string;
  unitLbsLabel: string;
  onUnitChange: (unit: OnboardingWeightUnit) => void;
  onWeightKgChange: (weightKg: number) => void;
  className?: string;
};
