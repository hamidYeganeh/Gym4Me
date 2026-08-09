import type { FeaturedCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesRecommendSectionProps = {
  title: string;
  hint?: string;
  seeAllLabel: string;
  newLabel: string;
  closeLabel: string;
  certifiedLabel: string;
  yoeLabel: (years: number) => string;
  coaches: FeaturedCoach[];
  /** Hide dismiss control on feature cards. */
  dismissible?: boolean;
  onSeeAll?: () => void;
  onClose?: (id: string) => void;
  onCoachPress?: (id: string) => void;
};
