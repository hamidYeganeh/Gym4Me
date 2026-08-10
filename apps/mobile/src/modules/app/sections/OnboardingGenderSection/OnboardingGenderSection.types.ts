import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";

export type OnboardingGenderOption = {
  id: OnboardingGenderId;
  label: string;
};

export type OnboardingGenderSectionProps = {
  options: OnboardingGenderOption[];
  value: OnboardingGenderId | null;
  otherValue: string;
  otherPlaceholder: string;
  otherMax: number;
  onChange: (value: OnboardingGenderId) => void;
  onOtherChange: (value: string) => void;
  className?: string;
};
