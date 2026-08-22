"use client";

import { useEffect, useState } from "react";
import type { DiscoveryClubsQuery } from "@repo/api/discovery";
import { discoveryClubs } from "@/shared/lib/api";
import {
  checkDevicePermission,
  isDevicePermissionGranted,
} from "@/shared/lib/device-permissions";
import { useAuth } from "@/shared/providers/AuthProvider";

import type { BrowseClub } from "./clubs-browse-data";
import {
  MAX_HOME_NEARBY_CLUBS,
  NEARBY_CLUBS_RADIUS_METERS,
  mapDiscoveryClubToNearbyBrowse,
  originFromUser,
  readBrowserGeoPosition,
} from "./nearby-clubs-home";

export type DiscoveryHomeNearbyClubsState = {
  clubs: BrowseClub[];
  isLoading: boolean;
};

export function useDiscoveryHomeNearbyClubs(): DiscoveryHomeNearbyClubsState {
  const { user } = useAuth();
  const [state, setState] = useState<DiscoveryHomeNearbyClubsState>({
    clubs: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        let origin = originFromUser(user);
        if (!origin) {
          const permission = await checkDevicePermission("location");
          if (isDevicePermissionGranted(permission)) {
            origin = await readBrowserGeoPosition();
          }
        }

        if (!origin) {
          if (!cancelled) setState({ clubs: [], isLoading: false });
          return;
        }

        const query: DiscoveryClubsQuery = {
          page_size: MAX_HOME_NEARBY_CLUBS,
          lat: origin.lat,
          lng: origin.lng,
          radiusMeters: NEARBY_CLUBS_RADIUS_METERS,
        };
        const page = await discoveryClubs.list(query);
        if (cancelled) return;

        setState({
          clubs: page.result.map((club) =>
            mapDiscoveryClubToNearbyBrowse(club as never, origin),
          ),
          isLoading: false,
        });
      } catch {
        if (cancelled) return;
        setState({ clubs: [], isLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
