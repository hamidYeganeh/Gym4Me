import type { OwnerHomeClub } from "../../lib/owner-home-data";

export type OwnerHomeClubsSectionProps = {
  title: string;
  clubs: OwnerHomeClub[];
  actionLabel: string;
  pricePrefix: string;
  priceSuffix: string;
  shareLabel: string;
  favoriteLabel: string;
  onClubAction?: (clubId: string) => void;
};
