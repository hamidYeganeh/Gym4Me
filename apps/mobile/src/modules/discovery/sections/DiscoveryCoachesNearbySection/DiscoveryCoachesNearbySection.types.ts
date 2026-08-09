import type { NearbyCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesNearbySectionProps = {
  title: string;
  hint?: string;
  seeAllLabel: string;
  remoteLabel: string;
  inPersonLabel: string;
  coaches: NearbyCoach[];
  onSeeAll?: () => void;
  onCoachPress?: (id: string) => void;
};
