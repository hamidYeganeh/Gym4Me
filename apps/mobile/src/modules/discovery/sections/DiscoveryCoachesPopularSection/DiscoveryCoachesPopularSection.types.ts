import type { PopularCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesPopularSectionProps = {
  title: string;
  seeAllLabel: string;
  yoeLabel: (years: number) => string;
  coaches: PopularCoach[];
  onSeeAll?: () => void;
  onCoachPress?: (id: string) => void;
};
