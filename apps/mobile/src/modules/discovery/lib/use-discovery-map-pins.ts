"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { discoveryClubs, mediaFileUrl } from "@/shared/lib/api";
import {
  DEFAULT_SELECTED_COACH_ID,
  MAP_COACHES,
  type MapCoach,
} from "./map-data";

type State = {
  coaches: MapCoach[];
  initialSelectedId: string;
  isLoading: boolean;
  source: "api" | "mock";
};

const DEFAULT_RADIUS_METERS = 20_000;
/** Tehran fallback when geolocation is unavailable. */
const TEHRAN = { lat: 35.715, lng: 51.404 };

function readGeo(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
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

/** Map pins from approved clubs — prefers nearby geo query. */
export function useDiscoveryMapPins(): State {
  const [state, setState] = useState<State>({
    coaches: MAP_COACHES,
    initialSelectedId: DEFAULT_SELECTED_COACH_ID,
    isLoading: true,
    source: "mock",
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const geo = (await readGeo()) ?? TEHRAN;
        const query: DiscoveryClubsQuery = {
          page_size: 40,
          lat: geo.lat,
          lng: geo.lng,
          radiusMeters: DEFAULT_RADIUS_METERS,
        };
        const page = await discoveryClubs.list(query);
        if (cancelled) return;

        let pins: MapCoach[] = page.result
          .filter((club) => club.location?.point)
          .map((club) => ({
            id: club.id,
            name: club.identity.name,
            image:
              mediaFileUrl(club.identity.coverMediaId) ??
              mediaFileUrl(club.gallery[0]?.mediaId) ??
              PLACEHOLDER_IMAGE,
            specialtyLabel:
              club.location?.address?.split("،")[0] ?? "باشگاه",
            rating: club.reviewsSummary.average,
            ratingCount: club.reviewsSummary.count,
            address: club.location?.address ?? "",
            lat: club.location!.point!.lat,
            lng: club.location!.point!.lng,
            detailsHref: `/discovery/clubs/${club.id}`,
          }));

        if (pins.length === 0) {
          const fallback = await discoveryClubs.list({ page_size: 40 });
          if (cancelled) return;
          pins = fallback.result
            .filter((club) => club.location?.point)
            .map((club) => ({
              id: club.id,
              name: club.identity.name,
              image:
                mediaFileUrl(club.identity.coverMediaId) ??
                mediaFileUrl(club.gallery[0]?.mediaId) ??
                PLACEHOLDER_IMAGE,
              specialtyLabel:
                club.location?.address?.split("،")[0] ?? "باشگاه",
              rating: club.reviewsSummary.average,
              ratingCount: club.reviewsSummary.count,
              address: club.location?.address ?? "",
              lat: club.location!.point!.lat,
              lng: club.location!.point!.lng,
              detailsHref: `/discovery/clubs/${club.id}`,
            }));
        }

        if (pins.length === 0) {
          setState({
            coaches: MAP_COACHES,
            initialSelectedId: DEFAULT_SELECTED_COACH_ID,
            isLoading: false,
            source: "mock",
          });
          return;
        }

        setState({
          coaches: pins,
          initialSelectedId: pins[0]!.id,
          isLoading: false,
          source: "api",
        });
      } catch {
        if (cancelled) return;
        setState({
          coaches: MAP_COACHES,
          initialSelectedId: DEFAULT_SELECTED_COACH_ID,
          isLoading: false,
          source: "mock",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
