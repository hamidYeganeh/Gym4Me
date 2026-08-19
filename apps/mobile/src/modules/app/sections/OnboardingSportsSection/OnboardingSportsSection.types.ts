export type OnboardingSportOption = {
  id: string;
  label: string;
  slug: string;
  icon?: string | null;
};

export type OnboardingSportsSectionProps = {
  label: string;
  options: OnboardingSportOption[];
  selected: string[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel: string;
  errorLabel: string;
  className?: string;
};
