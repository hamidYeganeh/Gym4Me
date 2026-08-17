import type { ReactNode } from "react";

export type DiscoveryClubsReserveHeroSectionProps = {
  clubTitle: string;
  clubLocation?: string;
  clubImage: string;
  onBack: () => void;
  children?: ReactNode;
};
