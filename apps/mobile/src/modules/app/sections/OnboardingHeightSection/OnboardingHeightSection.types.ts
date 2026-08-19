import type {
  OnboardingHeightUnit,
  OnboardingHeightUnitOption,
} from "@/modules/app/lib/onboarding-units";

export type OnboardingHeightSectionProps = {
  label: string;
  unit: OnboardingHeightUnit;
  heightCm: number;
  unitOptions: OnboardingHeightUnitOption[];
  onUnitChange: (unit: OnboardingHeightUnit) => void;
  onHeightCmChange: (heightCm: number) => void;
  className?: string;
};
