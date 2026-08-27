import type { HTMLAttributes } from "react";

/** Geographic coordinate (WGS84). */
export type LocationPickerLatLng = {
  lat: number;
  lng: number;
};

export type LocationPickerMapProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange" | "value"
> & {
  /** Selected point. When null, no pin is shown until the user taps. */
  value?: LocationPickerLatLng | null;
  /** Called when the user picks a point on the map. */
  onChange?: (value: LocationPickerLatLng) => void;
  /**
   * Map center when there is no value yet.
   * Defaults to Tehran.
   */
  defaultCenter?: LocationPickerLatLng;
  /** Initial map zoom (default `14`). */
  defaultZoom?: number;
  /** Minimum zoom level. */
  minZoom?: number;
  /** Maximum zoom level. */
  maxZoom?: number;
  /** Accessible label for zoom in. */
  zoomInLabel?: string;
  /** Accessible label for zoom out. */
  zoomOutLabel?: string;
  /**
   * Optional custom tile URL template (`{z}/{x}/{y}` or `{s}` subdomain).
   * Defaults to Carto/OSM basemaps (no API key; suitable for Iran).
   */
  tileUrl?: string;
};
