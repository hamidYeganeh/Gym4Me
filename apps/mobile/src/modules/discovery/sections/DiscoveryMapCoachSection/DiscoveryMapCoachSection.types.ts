import type { MapCoach } from "../../lib/map-data";

export type DiscoveryMapCoachSectionProps = {
  coach: MapCoach;
  getDirectionsLabel: string;
  viewDetailsLabel: string;
  onGetDirections?: () => void;
  onViewDetails?: () => void;
};
