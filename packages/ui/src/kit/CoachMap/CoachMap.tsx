"use client";

import { Button } from "@heroui/react/button";
import { Skeleton } from "@heroui/react/skeleton";
import { Slider } from "@heroui/react/slider";
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
  Circle,
  DivIcon,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  TileLayer,
} from "leaflet";
import { mapLocationPinHtml } from "../shared/map-location-pin";
import { coachMapVariants } from "./CoachMap.styles";
import type {
  CoachMapLatLng,
  CoachMapMarker,
  CoachMapProps,
} from "./CoachMap.types";

/** Carto raster tiles (OSM data) — no API key; works for Iran usage. */
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";

const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_ZOOM = 14;
const DEFAULT_MIN_ZOOM = 11;
const DEFAULT_MAX_ZOOM = 18;
const DEFAULT_RANGE_RINGS_METERS = [350, 700, 1100] as const;

type MapThemeColors = {
  accent: string;
  inactiveRing: string;
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
    inactiveRing: resolveCssColor("--overlay", "#111111"),
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

function markerIcon(
  L: typeof import("leaflet"),
  colors: MapThemeColors,
  options: {
    active: boolean;
    pulse: boolean;
    imageUrl?: string | null;
    distanceLabel?: string | null;
  },
): DivIcon {
  return L.divIcon({
    className: "coach-map-pin",
    html: mapLocationPinHtml({
      accent: colors.accent,
      inactiveRing: colors.inactiveRing,
      imageUrl: options.imageUrl,
      active: options.active,
      pulse: options.pulse,
      distanceLabel: options.distanceLabel,
    }),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function CoachMap({
  markers,
  selectedId = null,
  nearestId = null,
  onSelect,
  rangeRingMeters = DEFAULT_RANGE_RINGS_METERS,
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
  const ringsRef = useRef<Circle[]>([]);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(defaultZoom);

  const pulseId = nearestId ?? selectedId;

  const markersKey = markers
    .map(
      (m) =>
        `${m.id}:${m.lat},${m.lng}:${m.image ?? ""}:${m.distanceLabel ?? ""}`,
    )
    .join("|");
  const selectedMarker = markers.find((m) => m.id === selectedId);
  const pulseMarker = markers.find((m) => m.id === pulseId) ?? selectedMarker;
  const markersByIdRef = useRef(new Map<string, CoachMapMarker>());
  markersByIdRef.current = new Map(markers.map((m) => [m.id, m]));
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

  const syncRangeRings = useCallback(
    (L: typeof import("leaflet"), map: LeafletMap, colors: MapThemeColors) => {
      for (const ring of ringsRef.current) {
        ring.remove();
      }
      ringsRef.current = [];

      const anchor = selectedMarker ?? pulseMarker;
      if (!anchor || rangeRingMeters.length === 0) return;

      ringsRef.current = rangeRingMeters.map((radius, index) => {
        const opacity = Math.max(0.12, 0.34 - index * 0.08);
        return L.circle([anchor.lat, anchor.lng], {
          radius,
          color: colors.accent,
          weight: 1.5,
          opacity,
          fillColor: colors.accent,
          fillOpacity: opacity * 0.28,
          interactive: false,
          className: "coach-map-range-ring",
        }).addTo(map);
      });
    },
    [pulseMarker, rangeRingMeters, selectedMarker],
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
        const pulse = item.id === pulseId;
        const marker = L.marker([item.lat, item.lng], {
          icon: markerIcon(L, colors, {
            active,
            pulse,
            imageUrl: item.image,
            distanceLabel: active || pulse ? item.distanceLabel : null,
          }),
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: pulse || active ? 600 : 0,
        }).addTo(map);

        marker.on("click", () => {
          onSelectRef.current?.(item.id);
        });
        markerMap.set(item.id, marker);
      }

      syncRangeRings(L, map, colors);

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
      for (const ring of ringsRef.current) {
        ring.remove();
      }
      ringsRef.current = [];
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

  // Sync pin styles, range rings, and pan when selection / nearest changes.
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return;
    const L = leafletRef.current;
    const colors = resolveMapThemeColors();

    markersRef.current.forEach((marker, id) => {
      const item = markersByIdRef.current.get(id);
      const active = id === selectedId;
      const pulse = id === pulseId;
      marker.setIcon(
        markerIcon(L, colors, {
          active,
          pulse,
          imageUrl: item?.image,
          distanceLabel: active || pulse ? item?.distanceLabel : null,
        }),
      );
      marker.setZIndexOffset(pulse || active ? 600 : 0);
    });

    syncRangeRings(L, mapRef.current, colors);

    if (selectedMarker) {
      mapRef.current.panTo([selectedMarker.lat, selectedMarker.lng], {
        animate: true,
      });
    }
  }, [mapReady, selectedId, pulseId, selectedMarker, syncRangeRings]);

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
        const item = markersByIdRef.current.get(id);
        const active = id === selectedId;
        const pulse = id === pulseId;
        marker.setIcon(
          markerIcon(L, colors, {
            active,
            pulse,
            imageUrl: item?.image,
            distanceLabel: active || pulse ? item?.distanceLabel : null,
          }),
        );
      });
      syncRangeRings(L, map, colors);
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
  }, [mapReady, tileUrl, selectedId, pulseId, syncRangeRings]);

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
