export type DiscoveryCoachesReserveActionsSectionProps = {
  price: number;
  ctaLabel: string;
  canGoNext: boolean;
  isSubmitting: boolean;
  step: 0 | 1 | 2;
  hasSelectedSlot: boolean;
  onNext: () => void;
};
