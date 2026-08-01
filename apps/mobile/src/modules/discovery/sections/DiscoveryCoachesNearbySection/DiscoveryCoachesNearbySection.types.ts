import type { NearbyCoach } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesNearbySectionProps = {
  title: string;
  seeAllLabel: string;
  remoteLabel: string;
  inPersonLabel: string;
  coaches: NearbyCoach[];
  onSeeAll?: () => void;
  onCoachPress?: (id: string) => void;
};
