import type { ReactNode } from "react";
import type { CoachDetail } from "../../lib/coach-detail-data";

export type DiscoveryCoachesDetailHeroSectionProps = {
  coach: CoachDetail;
  children?: ReactNode;
};
