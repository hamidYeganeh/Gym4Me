import type { OnboardingDietId } from "@/modules/app/lib/onboarding-data";

export type OnboardingDietOption = {
  id: OnboardingDietId;
  title: string;
  description: string;
};

export type OnboardingDietSectionProps = {
  label: string;
  options: OnboardingDietOption[];
  value: OnboardingDietId;
  onChange: (value: OnboardingDietId) => void;
  className?: string;
};
