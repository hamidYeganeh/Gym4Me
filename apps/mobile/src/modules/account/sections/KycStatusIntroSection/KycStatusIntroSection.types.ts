export type KycStatusIntroSectionProps = {
  title: string;
  subtitle: string;
  figureSrc: string;
  tips: readonly string[];
  error?: string | null;
  readyLabel: string;
  skipLabel: string;
  onReady: () => void;
  onSkip: () => void;
  onBack: () => void;
  backLabel: string;
  className?: string;
};
