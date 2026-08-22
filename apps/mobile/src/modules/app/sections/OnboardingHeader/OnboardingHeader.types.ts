export type OnboardingHeaderProps = {
  progress: number;
  progressLabel: string;
  stepLabel: string;
  skipLabel: string;
  backLabel: string;
  onBack: () => void;
  onSkip: () => void;
  className?: string;
};
