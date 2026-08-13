export type DiscoveryClubsDetailActionsSectionProps = {
  pricePrefix: string;
  /** Numeric price animated with NumberFlow. */
  price: number;
  priceSuffix: string;
  /** Primary CTA label (defaults to confirm booking). */
  ctaLabel?: string;
  pending?: boolean;
  onReserve?: () => void;
};
