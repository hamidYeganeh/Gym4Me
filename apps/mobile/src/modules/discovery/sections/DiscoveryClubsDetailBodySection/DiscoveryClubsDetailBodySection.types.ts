import type { ClubDetail } from "../../lib/club-detail-data";

export type DiscoveryClubsDetailBodySectionProps = {
  club: ClubDetail;
  /** Currently selected subscription plan id. */
  selectedSubscriptionId: string;
  /** Called when the user picks a different subscription radio. */
  onSubscriptionChange: (planId: string) => void;
};
