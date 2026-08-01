import type { MapCoach } from "../../lib/map-data";

export type DiscoveryMapScreenProps = {
  coaches: readonly MapCoach[];
  initialSelectedId: string;
};
