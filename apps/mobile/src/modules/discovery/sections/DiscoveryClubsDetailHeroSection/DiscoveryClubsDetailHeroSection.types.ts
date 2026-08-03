import type { ReactNode } from "react";

export type DiscoveryClubsDetailHeroSectionProps = {
  title: string;
  location: string;
  images: string[];
  /** Average rating shown in the sheet header badge. */
  rating?: number;
  /** Review count shown under the rating badge. */
  reviewCount?: number;
  isFavorite?: boolean;
  children?: ReactNode;
};
