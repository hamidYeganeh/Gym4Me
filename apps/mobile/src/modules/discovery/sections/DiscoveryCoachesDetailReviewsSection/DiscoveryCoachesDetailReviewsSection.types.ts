import type { HTMLAttributes } from "react";
import type { CoachDetail } from "../../lib/coach-detail-data";

export type DiscoveryCoachesDetailReviewsSectionProps =
  HTMLAttributes<HTMLElement> & {
    coach: CoachDetail;
  };
