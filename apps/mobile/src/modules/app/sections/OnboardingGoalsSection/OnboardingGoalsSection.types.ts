import type { OnboardingGoalId } from "@/modules/app/lib/onboarding-data";

export type OnboardingGoalOption = {
  id: OnboardingGoalId;
  label: string;
};

export type OnboardingGoalsSectionProps = {
  label: string;
  options: OnboardingGoalOption[];
  selected: OnboardingGoalId[];
  onToggle: (id: OnboardingGoalId) => void;
  className?: string;
};
