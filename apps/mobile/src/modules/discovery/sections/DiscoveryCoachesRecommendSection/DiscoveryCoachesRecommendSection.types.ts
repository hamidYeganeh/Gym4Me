import type { FeaturedCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesRecommendSectionProps = {
  title: string;
  seeAllLabel: string;
  newLabel: string;
  closeLabel: string;
  certifiedLabel: string;
  yoeLabel: (years: number) => string;
  coaches: FeaturedCoach[];
  onSeeAll?: () => void;
  onClose?: (id: string) => void;
};
