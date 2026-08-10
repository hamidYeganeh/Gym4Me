import type { OnboardingMoodId } from "@/modules/app/lib/onboarding-data";

export type OnboardingMoodOption = {
  id: OnboardingMoodId;
  statement: string;
};

export type OnboardingMoodSectionProps = {
  options: OnboardingMoodOption[];
  value: OnboardingMoodId;
  onChange: (value: OnboardingMoodId) => void;
  className?: string;
};
