import type { OnboardingHeightUnit } from "@/modules/app/lib/onboarding-units";

export type OnboardingHeightSectionProps = {
  label: string;
  unit: OnboardingHeightUnit;
  heightCm: number;
  unitCmLabel: string;
  unitFtLabel: string;
  onUnitChange: (unit: OnboardingHeightUnit) => void;
  onHeightCmChange: (heightCm: number) => void;
  className?: string;
};
