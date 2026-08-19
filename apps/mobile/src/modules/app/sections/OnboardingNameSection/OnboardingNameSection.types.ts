export type OnboardingNameSectionProps = {
  firstNameLabel: string;
  lastNameLabel: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  hint: string;
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  className?: string;
};
