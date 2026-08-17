export type DiscoveryClubsReserveActionsSectionProps = {
  displayPrice: number;
  priceSuffix: string;
  selectedPlan?: { id: string };
  ctaLabel: string;
  canGoNext: boolean;
  isSubmitting: boolean;
  step: 0 | 1 | 2;
  hasSelectedSlot: boolean;
  hasSelectedPlan: boolean;
  submitError: string | null;
  onNext: () => void;
};
