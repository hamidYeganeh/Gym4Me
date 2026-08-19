import type {
  OnboardingWeightUnit,
  OnboardingWeightUnitOption,
} from "@/modules/app/lib/onboarding-units";

export type OnboardingWeightSectionProps = {
  label: string;
  unit: OnboardingWeightUnit;
  weightKg: number;
  unitOptions: OnboardingWeightUnitOption[];
  onUnitChange: (unit: OnboardingWeightUnit) => void;
  onWeightKgChange: (weightKg: number) => void;
  className?: string;
};
