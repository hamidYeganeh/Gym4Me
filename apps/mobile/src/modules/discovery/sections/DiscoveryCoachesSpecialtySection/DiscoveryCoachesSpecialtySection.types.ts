import type { CoachSpecialty } from "../../lib/coaches-browse-data";

export type DiscoveryCoachesSpecialtySectionProps = {
  title: string;
  seeAllLabel: string;
  specialties: CoachSpecialty[];
  onSeeAll?: () => void;
  onSpecialtyPress?: (id: CoachSpecialty["id"]) => void;
};
