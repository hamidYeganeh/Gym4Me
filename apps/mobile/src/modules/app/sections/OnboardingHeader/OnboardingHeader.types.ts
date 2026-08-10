export type OnboardingHeaderProps = {
  progress: number;
  progressLabel: string;
  skipLabel: string;
  backLabel: string;
  onBack: () => void;
  onSkip: () => void;
  /** When false, progress + skip are hidden (phase intro / form chrome). */
  showProgress?: boolean;
  className?: string;
};
