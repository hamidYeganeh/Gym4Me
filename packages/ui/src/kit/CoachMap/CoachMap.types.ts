import type { HTMLAttributes } from "react";

/** Geographic coordinate (WGS84). */
export type CoachMapLatLng = {
  lat: number;
  lng: number;
};

export type CoachMapMarker = CoachMapLatLng & {
  id: string;
  /** Optional avatar / logo shown inside the location pin. */
  image?: string | null;
  /** Distance chip above the pin (e.g. "۵۰۰ متر"). */
  distanceLabel?: string | null;
};

export type CoachMapProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onSelect"
> & {
  /** Coach / club pin markers. */
  markers: readonly CoachMapMarker[];
  /** Currently selected marker id. */
  selectedId?: string | null;
  /**
   * Nearest club/coach id — draws pulse rings on that pin.
   * Defaults to `selectedId` when omitted.
   */
  nearestId?: string | null;
  /** Called when a pin is pressed. */
  onSelect?: (id: string) => void;
  /**
   * Concentric range rings (meters) around the selected / nearest pin.
   * Empty / omitted disables rings.
   */
  rangeRingMeters?: readonly number[];
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
