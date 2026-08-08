import type {
  CoachSpecialty,
  ExpertCoach,
  FeaturedCoach,
  NearbyCoach,
  PopularCoach,
} from "../../lib/coaches-browse-data";

export type DiscoveryCoachesScreenProps = {
  specialties: CoachSpecialty[];
  featuredCoaches: FeaturedCoach[];
  popularCoaches: PopularCoach[];
  expertCoaches: ExpertCoach[];
  nearbyCoaches: NearbyCoach[];
  isEmpty?: boolean;
};
