import type { CoachDetail } from "../../lib/coach-detail-data";

export type DiscoveryCoachesDetailBodySectionProps = {
  coach: CoachDetail;
  selectedPackageId: string;
  onPackageChange: (packageId: string) => void;
};
