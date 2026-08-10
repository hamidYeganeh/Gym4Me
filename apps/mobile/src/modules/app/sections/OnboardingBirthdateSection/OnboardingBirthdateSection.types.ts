export type OnboardingBirthdateValue = {
  year: number;
  month: number;
  day: number;
};

export type OnboardingBirthdateSectionProps = {
  ageLabel: string;
  /** Accessible label for the calendar. */
  calendarAria: string;
  value: OnboardingBirthdateValue;
  onChange: (value: OnboardingBirthdateValue) => void;
  className?: string;
};
