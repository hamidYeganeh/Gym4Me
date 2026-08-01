import type { ExpertCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesExpertSectionProps = {
  title: string;
  seeAllLabel: string;
  verifiedLabel: string;
  coaches: ExpertCoach[];
  onSeeAll?: () => void;
  onCoachPress?: (id: string) => void;
};
