import type { ReactNode } from "react";

export type DiscoveryClubsDetailHeroSectionProps = {
  title: string;
  location: string;
  images: string[];
  isFavorite?: boolean;
  children?: ReactNode;
};
