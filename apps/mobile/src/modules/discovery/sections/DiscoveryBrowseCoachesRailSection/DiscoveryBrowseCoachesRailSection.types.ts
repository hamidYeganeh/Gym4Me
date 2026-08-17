import type { BrowseCoach } from "../../lib/coaches-browse-data";

export type DiscoveryBrowseCoachesRailVariant =
  | "featured"
  | "nearby"
  | "remote"
  | "inPerson"
  | "topRated"
  | "picks";

export type DiscoveryBrowseCoachesRailSectionProps = {
  variant: DiscoveryBrowseCoachesRailVariant;
  coaches: BrowseCoach[];
};
