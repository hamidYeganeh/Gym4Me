export type OnboardingAthleteLevelOption = {
  value: string;
  name: string;
  description: string;
};

export type OnboardingAthleteLevelSectionProps = {
  label: string;
  levelLabel: (level: number) => string;
  dragHint: string;
  options: OnboardingAthleteLevelOption[];
  value: string | null;
  onChange: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel: string;
  errorLabel: string;
  className?: string;
};
