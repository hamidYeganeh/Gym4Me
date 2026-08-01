import type { CoachMapMarker } from "@repo/ui/kit/CoachMap";

export type DiscoveryMapCanvasSectionProps = {
  markers: readonly CoachMapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomLabel: string;
};
