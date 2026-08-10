import type { OnboardingActivityId } from "@/modules/app/lib/onboarding-data";

export type OnboardingActivityOption = {
  id: OnboardingActivityId;
  label: string;
};

export type OnboardingActivitiesSectionProps = {
  label: string;
  options: OnboardingActivityOption[];
  selected: OnboardingActivityId[];
  onToggle: (id: OnboardingActivityId) => void;
  className?: string;
};
