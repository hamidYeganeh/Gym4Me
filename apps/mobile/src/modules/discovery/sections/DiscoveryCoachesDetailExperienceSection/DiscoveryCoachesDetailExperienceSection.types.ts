import type { ComponentPropsWithoutRef } from "react";
import type { CoachDetailExperience } from "../../lib/coach-detail-data";

export type DiscoveryCoachesDetailExperienceSectionProps =
  ComponentPropsWithoutRef<"section"> & {
    experience: CoachDetailExperience;
  };
