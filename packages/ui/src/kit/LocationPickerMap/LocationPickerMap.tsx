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
  DivIcon,
  LatLngExpression,
  Map as LeafletMap,
  Marker,
  TileLayer,
} from "leaflet";
import { mapLocationPinHtml } from "../shared/map-location-pin";
import { locationPickerMapVariants } from "./LocationPickerMap.styles";
import type {
  LocationPickerLatLng,
  LocationPickerMapProps,
} from "./LocationPickerMap.types";

/** Carto raster tiles (OSM data) — no API key; works for Iran usage. */
const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const DEFAULT_ZOOM = 14;
const DEFAULT_MIN_ZOOM = 5;
const DEFAULT_MAX_ZOOM = 18;
const DEFAULT_CENTER: LocationPickerLatLng = { lat: 35.6892, lng: 51.389 };

type MapThemeColors = {
  accent: string;
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

function markerIcon(
  L: typeof import("leaflet"),
  colors: MapThemeColors,
): DivIcon {
  return L.divIcon({
    className: "location-picker-pin",
    html: mapLocationPinHtml({
      accent: colors.accent,
      active: true,
    }),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function LocationPickerMap({
  value = null,
  onChange,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  zoomLabel = "Map zoom",
  tileUrl,
  className,
  ...props
}: LocationPickerMapProps) {
  const slots = locationPickerMapVariants();
  const reactId = useId().replace(/:/g, "");
  const mapId = `location-picker-map-${reactId}`;

  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(defaultZoom);

  const center = value ?? defaultCenter;

  const applyZoom = useCallback(
    (next: number) => {
      const clamped = Math.min(maxZoom, Math.max(minZoom, next));
      setZoom(clamped);
      mapRef.current?.setZoom(clamped);
    },
    [maxZoom, minZoom],
  );

  useEffect(() => {
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
        [center.lat, center.lng] as LatLngExpression,
        defaultZoom,
      );

      if (value) {
        const marker = L.marker([value.lat, value.lng], {
          icon: markerIcon(L, colors),
          keyboard: true,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const latLng = marker.getLatLng();
          onChangeRef.current?.({ lat: latLng.lat, lng: latLng.lng });
        });
        markerRef.current = marker;
      }

      map.on("click", (event) => {
        onChangeRef.current?.({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
        });
      });

      map.on("zoomend", () => {
        setZoom(map.getZoom());
      });

      mapRef.current = map;
      tileRef.current = tiles;
      setZoom(map.getZoom());
      setMapReady(true);

      requestAnimationFrame(() => {
        map.invalidateSize({ animate: false });
      });
    }

    void mountMap();

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileRef.current = null;
      setMapReady(false);
    };
    // Mount once; value sync handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per map id / tile config
  }, [mapId, tileUrl, defaultZoom, minZoom, maxZoom]);

  // Sync pin position when value changes.
  useEffect(() => {
    if (!mapReady || !leafletRef.current || !mapRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    const colors = resolveMapThemeColors();

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      const marker = L.marker([value.lat, value.lng], {
        icon: markerIcon(L, colors),
        keyboard: true,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        onChangeRef.current?.({ lat: latLng.lat, lng: latLng.lng });
      });
      markerRef.current = marker;
    }

    map.panTo([value.lat, value.lng], { animate: true });
  }, [mapReady, value]);

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
      if (markerRef.current) {
        markerRef.current.setIcon(markerIcon(L, colors));
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
  }, [mapReady, tileUrl]);

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
