export type OnboardingDietOption = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
};

export type OnboardingDietSectionProps = {
  label: string;
  options: OnboardingDietOption[];
  value: string | null;
  onChange: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel: string;
  errorLabel: string;
  className?: string;
};
