import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";

/** Geographic coordinate (WGS84). */
export type ClubRouteMapLatLng = {
  lat: number;
  lng: number;
};

export type ClubRouteMapCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Route / location title (e.g. `"مسیر دویدن ۷"`). */
  title: ReactNode;
  /**
   * Address line under the title — typically
   * `استان، شهر، محله` or a free-form address.
   */
  address?: ReactNode;
  /** Duration meta (e.g. `"۴۰ دقیقه"` / `"40min"`). */
  duration?: ReactNode;
  /** Calories meta (e.g. `"۱۵۰ کالری"` / `"150kcal"`). */
  calories?: ReactNode;
  /** Stretch edge-to-edge (no max-width / side borders on mobile). */
  fullWidth?: boolean;
  /**
   * Ordered path coordinates. Use real Iran locations (WGS84).
   * At least two points are required to draw a route.
   */
  route: readonly ClubRouteMapLatLng[];
  /** Mid-route distance chip (e.g. `"۷٫۲ کیلومتر"`). */
  distanceLabel?: ReactNode;
  /** Label on the start waypoint chip. */
  startLabel?: string;
  /** Label on the end waypoint chip. */
  endLabel?: string;
  /** Primary action (running CTA). */
  onAction?: ButtonProps["onPress"];
  /** Called when the fit / fullscreen control is pressed. */
  onFullscreen?: ButtonProps["onPress"];
  /** Accessible label for the primary action. */
  actionLabel?: string;
  /** Accessible label for zoom in. */
  zoomInLabel?: string;
  /** Accessible label for zoom out. */
  zoomOutLabel?: string;
  /** Accessible label for fit-bounds / fullscreen. */
  fullscreenLabel?: string;
  /**
   * Optional custom tile URL template (`{z}/{x}/{y}` or `{s}` subdomain).
   * Defaults to Carto/OSM basemaps (no API key; suitable for Iran).
   */
  tileUrl?: string;
  /** Fixed map viewport height in px. */
  mapHeight?: number;
  /**
   * When `true`, the Leaflet bundle loads only after the card enters the
   * viewport (default). Set `false` to mount the map immediately.
   */
  lazyMap?: boolean;
};
