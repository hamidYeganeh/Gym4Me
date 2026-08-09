"use client";

import { Button, Card, Skeleton } from "@heroui/react";
import { Clock } from "@repo/icons/Clock";
import { Compass } from "@repo/icons/Compass";
import { Fire1 } from "@repo/icons/Fire1";
import { Maximize } from "@repo/icons/Maximize";
import { Minus } from "@repo/icons/Minus";
import { Plus } from "@repo/icons/Plus";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type {
  DivIcon,
  LatLngBoundsExpression,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  Polyline,
  TileLayer,
} from "leaflet";
import { clubRouteMapCardVariants } from "./ClubRouteMapCard.styles";
import type {
  ClubRouteMapCardProps,
  ClubRouteMapLatLng,
} from "./ClubRouteMapCard.types";

const DEFAULT_MAP_HEIGHT = 260;

/** Carto raster tiles (OSM data) — no API key; works for Iran usage. */
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type MapThemeColors = {
  accent: string;
  accentForeground: string;
  overlay: string;
  overlayForeground: string;
  muted: string;
};

function midPoint(route: readonly ClubRouteMapLatLng[]): ClubRouteMapLatLng {
  const idx = Math.floor(route.length / 2);
  return route[idx] ?? route[0]!;
}

function toLatLngs(route: readonly ClubRouteMapLatLng[]): LatLngExpression[] {
  return route.map((p) => [p.lat, p.lng] as LatLngExpression);
}

function resolveCssColor(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return resolved && resolved !== "rgba(0, 0, 0, 0)" ? resolved : fallback;
}

function resolveMapThemeColors(): MapThemeColors {
  return {
    accent: resolveCssColor("--accent", "oklch(87.43% 0.2460 148.26)"),
    accentForeground: resolveCssColor(
      "--accent-foreground",
      "oklch(15% 0.0300 148.26)",
    ),
    overlay: resolveCssColor("--surface-foreground", "oklch(21.03% 0 0)"),
    overlayForeground: resolveCssColor(
      "--surface-foreground",
      "oklch(21.03% 0 0)",
    ),
    muted: resolveCssColor(
      "--surface-secondary-foreground",
      "oklch(21.03% 0 0)",
    ),
  };
}

function isDarkTheme() {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  return (
    root.classList.contains("dark") ||
    root.getAttribute("data-theme") === "dark" ||
    (!root.classList.contains("light") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function tipHtml(options: {
  label: string;
  background: string;
  color: string;
  withDot?: boolean;
  dotColor?: string;
  shadowColor?: string;
}) {
  const {
    label,
    background,
    color,
    withDot = false,
    dotColor = color,
    shadowColor = "rgba(0,0,0,0.25)",
  } = options;
  const escaped = label
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const dot = withDot
    ? `<span style="display:block;margin:2px auto 0;width:10px;height:10px;border-radius:9999px;background:${dotColor};box-shadow:0 0 0 2px color-mix(in oklab,${dotColor} 35%,transparent)"></span>`
    : "";
  return `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:none;user-select:none">
    <span style="background:${background};color:${color};border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;line-height:1.2;box-shadow:0 4px 12px ${shadowColor};white-space:nowrap">${escaped}</span>
    <span style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${background}"></span>
    ${dot}
  </div>`;
}

function waypointIcon(
  L: typeof import("leaflet"),
  label: string,
  colors: MapThemeColors,
): DivIcon {
  return L.divIcon({
    className: "club-route-map-tip",
    html: tipHtml({
      label,
      background: colors.overlay,
      color: colors.overlayForeground,
      withDot: true,
      dotColor: colors.overlay,
      shadowColor: `color-mix(in oklab, ${colors.muted} 45%, transparent)`,
    }),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function distanceIcon(
  L: typeof import("leaflet"),
  label: string,
  colors: MapThemeColors,
): DivIcon {
  return L.divIcon({
    className: "club-route-map-tip",
    html: tipHtml({
      label,
      background: colors.accent,
      color: colors.accentForeground,
      shadowColor: `color-mix(in oklab, ${colors.accent} 45%, transparent)`,
    }),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function ClubRouteMapCard({
  title,
  address,
  duration,
  calories,
  fullWidth = false,
  route,
  distanceLabel,
  startLabel = "Start",
  endLabel = "End",
  onAction,
  onFullscreen,
  actionLabel = "Start route",
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  fullscreenLabel = "Fit route",
  tileUrl,
  mapHeight = DEFAULT_MAP_HEIGHT,
  lazyMap = true,
  className,
  ...props
}: ClubRouteMapCardProps) {
  const slots = clubRouteMapCardVariants({ fullWidth });
  const reactId = useId();
  const mapId = `club-route-map-${reactId.replace(/:/g, "")}`;
  const showMeta = Boolean(duration) || Boolean(calories);

  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const lineRef = useRef<Polyline | null>(null);
  const glowRef = useRef<Polyline | null>(null);
  const startMarkerRef = useRef<Marker | null>(null);
  const endMarkerRef = useRef<Marker | null>(null);
  const distanceMarkerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const [visible, setVisible] = useState(!lazyMap);
  const [mapReady, setMapReady] = useState(false);

  const routeKey = route.map((p) => `${p.lat},${p.lng}`).join("|");
  const start = route[0];
  const end = route[route.length - 1];
  const mid = route.length > 0 ? midPoint(route) : undefined;

  useEffect(() => {
    if (!lazyMap || visible) return;
    const node = shellRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px", threshold: 0.01 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [lazyMap, visible]);

  const fitRoute = useCallback(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || route.length < 1) return;
    const bounds = L.latLngBounds(toLatLngs(route)) as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16, animate: true });
  }, [route, routeKey]);

  const handleFullscreen = useCallback(
    (e: Parameters<NonNullable<ClubRouteMapCardProps["onFullscreen"]>>[0]) => {
      fitRoute();
      onFullscreen?.(e);
    },
    [fitRoute, onFullscreen],
  );

  useEffect(() => {
    if (!visible || route.length < 2 || !start || !end) return;
    const startPoint = start;
    const endPoint = end;
    let cancelled = false;

    async function mountMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !shellRef.current) return;

      leafletRef.current = L;

      const container = document.getElementById(mapId);
      if (!container) return;

      // Leaflet mutates the container; guard remounts (Strict Mode).
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const colors = resolveMapThemeColors();
      const dark = isDarkTheme();
      const url = tileUrl ?? (dark ? TILE_DARK : TILE_LIGHT);

      const map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        preferCanvas: true,
      });

      const tiles = L.tileLayer(url, {
        attribution: TILE_ATTR,
        maxZoom: 19,
        updateWhenIdle: true,
        keepBuffer: 2,
      }).addTo(map);

      const latlngs = toLatLngs(route);
      const glow = L.polyline(latlngs, {
        color: colors.accent,
        weight: 10,
        opacity: 0.28,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(map);

      const line = L.polyline(latlngs, {
        color: colors.accent,
        weight: 5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }).addTo(map);

      const startMarker = L.marker([startPoint.lat, startPoint.lng], {
        icon: waypointIcon(L, startLabel, colors),
        interactive: false,
        keyboard: false,
      }).addTo(map);
      const endMarker = L.marker([endPoint.lat, endPoint.lng], {
        icon: waypointIcon(L, endLabel, colors),
        interactive: false,
        keyboard: false,
      }).addTo(map);

      let distanceMarker: Marker | null = null;
      if (distanceLabel != null && mid) {
        distanceMarker = L.marker([mid.lat, mid.lng], {
          icon: distanceIcon(L, String(distanceLabel), colors),
          interactive: false,
          keyboard: false,
        }).addTo(map);
      }

      map.fitBounds(L.latLngBounds(latlngs), {
        padding: [48, 48],
        maxZoom: 16,
        animate: false,
      });

      mapRef.current = map;
      tileRef.current = tiles;
      lineRef.current = line;
      glowRef.current = glow;
      startMarkerRef.current = startMarker;
      endMarkerRef.current = endMarker;
      distanceMarkerRef.current = distanceMarker;
      setMapReady(true);

      // Invalidate size after layout (card padding / fonts).
      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    }

    void mountMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileRef.current = null;
      lineRef.current = null;
      glowRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
      distanceMarkerRef.current = null;
      setMapReady(false);
    };
    // Intentionally key on routeKey / labels — remount when path changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- route serialized via routeKey
  }, [
    visible,
    mapId,
    routeKey,
    tileUrl,
    startLabel,
    endLabel,
    distanceLabel,
    start,
    end,
    mid,
  ]);

  // Sync basemap + route stroke + tip chips when theme toggles (no full remount).
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;

    const sync = () => {
      const map = mapRef.current;
      const L = leafletRef.current;
      if (!map || !L) return;

      const colors = resolveMapThemeColors();
      const dark = isDarkTheme();
      const url = tileUrl ?? (dark ? TILE_DARK : TILE_LIGHT);

      if (tileRef.current) {
        tileRef.current.setUrl(url);
      }
      lineRef.current?.setStyle({ color: colors.accent });
      glowRef.current?.setStyle({ color: colors.accent });
      startMarkerRef.current?.setIcon(waypointIcon(L, startLabel, colors));
      endMarkerRef.current?.setIcon(waypointIcon(L, endLabel, colors));
      if (distanceMarkerRef.current && distanceLabel != null) {
        distanceMarkerRef.current.setIcon(
          distanceIcon(L, String(distanceLabel), colors),
        );
      }
    };

    sync();
    const root = document.documentElement;
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, [mapReady, tileUrl, startLabel, endLabel, distanceLabel]);

  const shellStyle = {
    height: mapHeight,
  } satisfies CSSProperties;

  return (
    <Card className={slots.root({ className })} variant="default" {...props}>
      <div className={slots.mapShell()} ref={shellRef} style={shellStyle}>
        {!mapReady ? (
          <Skeleton aria-hidden className={slots.mapSkeleton()} />
        ) : null}
        <div className={slots.mapCanvas()} id={mapId} />

        <div className={slots.controlsStart()}>
          <Button
            aria-label={zoomInLabel}
            className={slots.mapButton()}
            isIconOnly
            onPress={() => mapRef.current?.zoomIn()}
            size="lg"
            variant="secondary"
          >
            <Plus size={18} />
          </Button>
          <Button
            aria-label={zoomOutLabel}
            className={slots.mapButton()}
            isIconOnly
            onPress={() => mapRef.current?.zoomOut()}
            size="lg"
            variant="secondary"
          >
            <Minus size={18} />
          </Button>
        </div>

        <div className={slots.controlsEnd()}>
          <Button
            aria-label={fullscreenLabel}
            className={slots.mapButton()}
            isIconOnly
            onPress={handleFullscreen}
            size="lg"
            variant="secondary"
          >
            <Maximize size={18} />
          </Button>
        </div>
      </div>

      <Card.Footer className={slots.footer()}>
        <div className={slots.footerText()}>
          <Card.Header className={slots.header()}>
            <Card.Title className={slots.title()}>{title}</Card.Title>
            {address ? (
              <Card.Description className={slots.address()}>
                {address}
              </Card.Description>
            ) : null}
            {showMeta ? (
              <Card.Description className={slots.meta()}>
                {duration ? (
                  <span className={slots.metaItem()}>
                    <Clock className={slots.metaIcon()} size={14} />
                    {duration}
                  </span>
                ) : null}
                {duration && calories ? (
                  <span aria-hidden className={slots.metaDot()} />
                ) : null}
                {calories ? (
                  <span className={slots.metaItem()}>
                    <Fire1 className={slots.metaIcon()} size={14} />
                    {calories}
                  </span>
                ) : null}
              </Card.Description>
            ) : null}
          </Card.Header>
        </div>

        <Button
          size="lg"
          aria-label={actionLabel}
          isIconOnly
          onPress={onAction}
          variant="primary"
        >
          <Compass size={22} />
        </Button>
      </Card.Footer>
    </Card>
  );
}
