import type { CoachSpecialty } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesSpecialtySectionProps = {
  title: string;
  hint?: string;
  seeAllLabel: string;
  specialties: CoachSpecialty[];
  onSeeAll?: () => void;
  onSpecialtyPress?: (id: CoachSpecialty["id"]) => void;
};
