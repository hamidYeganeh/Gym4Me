"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { discoveryClubs, mediaFileUrl } from "@/shared/lib/api";
import {
  checkDevicePermission,
  isDevicePermissionGranted,
} from "@/shared/lib/device-permissions";
import { useDevicePermissions } from "@/shared/providers/DevicePermissionsProvider";
import {
  pickNearestMapCoachId,
  withMapDistances,
  type MapCoach,
} from "./map-data";

type State = {
  coaches: MapCoach[];
  initialSelectedId: string;
  nearestId: string;
  isLoading: boolean;
  source: "api" | "mock";
};

const DEFAULT_RADIUS_METERS = 20_000;
/** Tehran fallback when geolocation is unavailable. */
const TEHRAN = { lat: 35.715, lng: 51.404 };

async function readGeoPosition(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 6_000, maximumAge: 60_000 },
    );
  });
}

function toPins(
  clubs: readonly {
    id: string;
    identity: { name: string; coverMediaId?: string | null };
    gallery: readonly { mediaId?: string | null }[];
    location?: {
      point?: { lat: number; lng: number } | null;
      address?: string | null;
    } | null;
    reviewsSummary: { average: number; count: number };
  }[],
): MapCoach[] {
  return clubs
    .filter((club) => club.location?.point)
    .map((club) => ({
      id: club.id,
      name: club.identity.name,
      image:
        mediaFileUrl(club.identity.coverMediaId) ??
        mediaFileUrl(club.gallery[0]?.mediaId) ??
        PLACEHOLDER_IMAGE,
      specialtyLabel: club.location?.address?.split("،")[0] ?? "باشگاه",
      rating: club.reviewsSummary.average,
      ratingCount: club.reviewsSummary.count,
      address: club.location?.address ?? "",
      lat: club.location!.point!.lat,
      lng: club.location!.point!.lng,
      detailsHref: `/discovery/clubs/${club.id}`,
      // Discovery list only returns approved clubs.
      verified: true,
    }));
}

/** Map pins from approved clubs — prefers nearby geo query. */
export function useDiscoveryMapPins(): State {
  const { ensurePermission } = useDevicePermissions();
  const [state, setState] = useState<State>({
    coaches: [],
    initialSelectedId: "",
    nearestId: "",
    isLoading: true,
    source: "api",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const existing = await checkDevicePermission("location");
        let geo: { lat: number; lng: number } | null = null;

        if (isDevicePermissionGranted(existing)) {
          geo = await readGeoPosition();
        } else {
          // Re-prompt when map needs location (e.g. user skipped/denied earlier).
          const result = await ensurePermission("location");
          if (result === "granted") {
            geo = await readGeoPosition();
          }
        }

        const origin = geo ?? TEHRAN;
        const query: DiscoveryClubsQuery = {
          page_size: 40,
          lat: origin.lat,
          lng: origin.lng,
          radiusMeters: DEFAULT_RADIUS_METERS,
        };
        const page = await discoveryClubs.list(query);
        if (cancelled) return;

        let pins = toPins(page.result);

        if (pins.length === 0) {
          const fallback = await discoveryClubs.list({ page_size: 40 });
          if (cancelled) return;
          pins = toPins(fallback.result);
        }

        if (pins.length === 0) {
          setState({
            coaches: [],
            initialSelectedId: "",
            nearestId: "",
            isLoading: false,
            source: "api",
          });
          return;
        }

        const ranked = withMapDistances(pins, origin);
        const nearestId = pickNearestMapCoachId(ranked) ?? ranked[0]!.id;
        setState({
          coaches: ranked,
          initialSelectedId: nearestId,
          nearestId,
          isLoading: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState({
          coaches: [],
          initialSelectedId: "",
          nearestId: "",
          isLoading: false,
          source: "api",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ensurePermission]);

  return state;
}
