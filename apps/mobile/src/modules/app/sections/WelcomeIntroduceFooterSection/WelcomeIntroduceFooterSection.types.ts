export type WelcomeIntroduceFooterSectionProps = {
  className?: string;
  slideCount: number;
  slide: number;
  isRtl: boolean;
  title: string;
  subtitle: string;
  leftLabel: string;
  rightLabel: string;
  onLeftPress: () => void;
  onRightPress: () => void;
};
