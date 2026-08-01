import type { HTMLAttributes } from "react";

/** Geographic coordinate (WGS84). */
export type CoachMapLatLng = {
  lat: number;
  lng: number;
};

export type CoachMapMarker = CoachMapLatLng & {
  id: string;
};

export type CoachMapProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  /** Coach pin markers. */
  markers: readonly CoachMapMarker[];
  /** Currently selected marker id. */
  selectedId?: string | null;
  /** Called when a pin is pressed. */
  onSelect?: (id: string) => void;
  /** Accessible label for zoom in. */
  zoomInLabel?: string;
  /** Accessible label for zoom out. */
  zoomOutLabel?: string;
  /** Accessible label for the zoom slider. */
  zoomLabel?: string;
  /**
   * Optional custom tile URL template (`{z}/{x}/{y}` or `{s}` subdomain).
   * Defaults to Carto/OSM basemaps (no API key; suitable for Iran).
   */
  tileUrl?: string;
  /** Initial map zoom (default `14`). */
  defaultZoom?: number;
  /** Minimum zoom level. */
  minZoom?: number;
  /** Maximum zoom level. */
  maxZoom?: number;
  /**
   * Optional center override. Defaults to the selected marker, then the
   * midpoint of all markers.
   */
  center?: CoachMapLatLng;
};
