import type { OnboardingGenderId } from "@/modules/app/lib/onboarding-data";

export type OnboardingGenderOption = {
  id: OnboardingGenderId;
  label: string;
};

export type OnboardingGenderSectionProps = {
  options: OnboardingGenderOption[];
  value: OnboardingGenderId | null;
  onChange: (value: OnboardingGenderId) => void;
  className?: string;
};
