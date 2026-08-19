export type OnboardingCaloriesSectionProps = {
  label: string;
  unitLabel: string;
  value: number;
  presets: readonly number[];
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
};
