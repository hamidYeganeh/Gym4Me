"use client";

import { Button, Skeleton, Slider } from "@heroui/react";
import { Minus } from "@repo/icons/Minus";
import { Plus } from "@repo/icons/Plus";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  DivIcon,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  TileLayer,
} from "leaflet";
import { coachMapVariants } from "./CoachMap.styles";
import type {
  CoachMapLatLng,
  CoachMapMarker,
  CoachMapProps,
} from "./CoachMap.types";

/** Carto raster tiles (OSM data) — no API key; works for Iran usage. */
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_ZOOM = 14;
const DEFAULT_MIN_ZOOM = 11;
const DEFAULT_MAX_ZOOM = 18;

type MapThemeColors = {
  accent: string;
  muted: string;
  surface: string;
};

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
    muted: resolveCssColor("--muted", "oklch(55.17% 0.0000 148.26)"),
    surface: resolveCssColor("--surface", "oklch(100% 0 0)"),
  };
}

function isDarkTheme() {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return (
    root.classList.contains("dark") ||
    root.getAttribute("data-theme") === "dark" ||
    (!root.classList.contains("light") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function midpoint(markers: readonly CoachMapMarker[]): CoachMapLatLng {
  if (markers.length === 0) return { lat: 35.715, lng: 51.395 };
  const sum = markers.reduce(
    (acc, marker) => ({
      lat: acc.lat + marker.lat,
      lng: acc.lng + marker.lng,
    }),
    { lat: 0, lng: 0 },
  );
  return {
    lat: sum.lat / markers.length,
    lng: sum.lng / markers.length,
  };
}

function pinHtml(options: {
  fill: string;
  surface: string;
  active: boolean;
  size: number;
}) {
  const { fill, surface, active, size } = options;
  const height = Math.round(size * 1.22);
  const r = Math.round(size * 0.22);
  const cy = Math.round(size * 0.38);
  const tipY = height - 2;
  const path = `M${size / 2} ${tipY} C${size * 0.12} ${size * 0.72} 2 ${size * 0.42} 2 ${size * 0.36} C2 ${size * 0.14} ${size * 0.22} 2 ${size / 2} 2 C${size * 0.78} 2 ${size - 2} ${size * 0.14} ${size - 2} ${size * 0.36} C${size - 2} ${size * 0.42} ${size * 0.88} ${size * 0.72} ${size / 2} ${tipY} Z`;
  const dot = active
    ? `<span style="display:block;margin:2px auto 0;width:8px;height:8px;border-radius:9999px;background:${fill};box-shadow:0 0 0 3px color-mix(in oklab,${fill} 35%,transparent)"></span>`
    : "";

  return `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;user-select:none;filter:drop-shadow(0 4px 10px color-mix(in oklab, ${surface} 35%, transparent))">
    <svg width="${size}" height="${height}" viewBox="0 0 ${size} ${height}" aria-hidden="true">
      <path d="${path}" fill="${fill}"/>
      <circle cx="${size / 2}" cy="${cy}" r="${r}" fill="${surface}"/>
    </svg>
    ${dot}
  </div>`;
}

function markerIcon(
  L: typeof import("leaflet"),
  colors: MapThemeColors,
  active: boolean,
): DivIcon {
  const size = active ? 40 : 32;
  return L.divIcon({
    className: "coach-map-pin",
    html: pinHtml({
      fill: active ? colors.accent : colors.muted,
      surface: colors.surface,
      active,
      size,
    }),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function CoachMap({
  markers,
  selectedId = null,
  onSelect,
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  zoomLabel = "Map zoom",
  tileUrl,
  defaultZoom = DEFAULT_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  center,
  className,
  ...props
}: CoachMapProps) {
  const slots = coachMapVariants();
  const reactId = useId();
  const mapId = `coach-map-${reactId.replace(/:/g, "")}`;

  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(defaultZoom);

  const markersKey = markers.map((m) => `${m.id}:${m.lat},${m.lng}`).join("|");
  const selectedMarker = markers.find((m) => m.id === selectedId);
  const mapCenter =
    center ??
    (selectedMarker
      ? { lat: selectedMarker.lat, lng: selectedMarker.lng }
      : midpoint(markers));

  const applyZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(maxZoom, Math.max(minZoom, next));
      setZoom(clamped);
      mapRef.current?.setZoom(clamped, { animate: true });
    },
    [maxZoom, minZoom],
  );

  useEffect(() => {
    if (markers.length === 0) return;
    let cancelled = false;

    async function mountMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;

      leafletRef.current = L;

      const container = document.getElementById(mapId);
      if (!container) return;

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
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: true,
        preferCanvas: true,
        minZoom,
        maxZoom,
      });

      const tiles = L.tileLayer(url, {
        attribution: TILE_ATTR,
        maxZoom,
        updateWhenIdle: true,
        keepBuffer: 2,
      }).addTo(map);

      map.setView(
        [mapCenter.lat, mapCenter.lng] as LatLngExpression,
        defaultZoom,
      );

      const markerMap = new Map<string, Marker>();
      for (const item of markers) {
        const active = item.id === selectedId;
        const marker = L.marker([item.lat, item.lng], {
          icon: markerIcon(L, colors, active),
          keyboard: true,
          riseOnHover: true,
        }).addTo(map);

        marker.on("click", () => {
          onSelectRef.current?.(item.id);
        });
        markerMap.set(item.id, marker);
      }

      map.on("zoomend", () => {
        setZoom(map.getZoom());
      });

      mapRef.current = map;
      tileRef.current = tiles;
      markersRef.current = markerMap;
      setZoom(map.getZoom());
      setMapReady(true);

      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    }

    void mountMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => {
        marker.remove();
      });
      markersRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileRef.current = null;
      setMapReady(false);
    };
    // Mount once per marker set / tile config; selection updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markersKey serializes markers
  }, [mapId, markersKey, tileUrl, defaultZoom, minZoom, maxZoom]);

  // Sync pin styles + pan when selection changes.
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return;
    const L = leafletRef.current;
    const colors = resolveMapThemeColors();

    markersRef.current.forEach((marker, id) => {
      marker.setIcon(markerIcon(L, colors, id === selectedId));
    });

    if (selectedMarker) {
      mapRef.current.panTo([selectedMarker.lat, selectedMarker.lng], {
        animate: true,
      });
    }
  }, [mapReady, selectedId, selectedMarker]);

  // Sync basemap when theme toggles.
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;

    const sync = () => {
      const map = mapRef.current;
      const L = leafletRef.current;
      if (!map || !L) return;

      const colors = resolveMapThemeColors();
      const dark = isDarkTheme();
      const url = tileUrl ?? (dark ? TILE_DARK : TILE_LIGHT);

      tileRef.current?.setUrl(url);
      markersRef.current.forEach((marker, id) => {
        marker.setIcon(markerIcon(L, colors, id === selectedId));
      });
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
  }, [mapReady, tileUrl, selectedId]);

  // Keep map sized when the shell resizes (safe areas / card height).
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const container = document.getElementById(mapId);
    if (!container || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [mapReady, mapId]);

  return (
    <div className={slots.root({ className })} {...props}>
      {!mapReady ? (
        <Skeleton aria-hidden className={slots.mapSkeleton()} />
      ) : null}
      <div className={slots.mapCanvas()} id={mapId} />

      <div className={slots.zoomControls()}>
        <Button
          aria-label={zoomInLabel}
          className={slots.zoomButton()}
          isIconOnly
          onPress={() => applyZoom(zoom + 1)}
          size="lg"
          variant="secondary"
        >
          <Plus size={18} />
        </Button>

        <Slider
          aria-label={zoomLabel}
          className={slots.zoomSlider()}
          maxValue={maxZoom}
          minValue={minZoom}
          onChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            if (typeof next === "number") applyZoom(next);
          }}
          orientation="vertical"
          step={1}
          value={zoom}
        >
          <Slider.Track className={slots.zoomTrack()}>
            <Slider.Fill className={slots.zoomFill()} />
            <Slider.Thumb className={slots.zoomThumb()} />
          </Slider.Track>
        </Slider>

        <Button
          aria-label={zoomOutLabel}
          className={slots.zoomButton()}
          isIconOnly
          onPress={() => applyZoom(zoom - 1)}
          size="lg"
          variant="secondary"
        >
          <Minus size={18} />
        </Button>
      </div>
    </div>
  );
}
