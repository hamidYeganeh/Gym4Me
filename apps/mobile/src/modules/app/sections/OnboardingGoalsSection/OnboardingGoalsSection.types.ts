export type OnboardingGoalOption = {
  id: string;
  label: string;
};

export type OnboardingGoalsSectionProps = {
  label: string;
  options: OnboardingGoalOption[];
  selected: string[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel: string;
  errorLabel: string;
  className?: string;
};
