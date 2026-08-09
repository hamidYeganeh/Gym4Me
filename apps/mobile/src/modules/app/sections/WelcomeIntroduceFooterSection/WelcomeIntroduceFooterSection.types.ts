export type WelcomeIntroduceFooterSectionProps = {
  className?: string;
  slideCount: number;
  slide: number;
  isRtl: boolean;
  leftLabel: string;
  rightLabel: string;
  onLeftPress: () => void;
  onRightPress: () => void;
};
