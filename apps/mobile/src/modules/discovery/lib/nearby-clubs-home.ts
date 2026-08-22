import type { PublicUser } from "@repo/api";
import {
  distanceMetersBetween,
  formatMapDistanceLabel,
} from "./map-data";
import { mapDiscoveryClubToBrowse } from "./map-discovery-club-browse";
import type { DiscoveryClubPayload } from "./map-discovery-club";
import type { BrowseClub } from "./clubs-browse-data";

export type GeoPoint = { lat: number; lng: number };

export const NEARBY_CLUBS_RADIUS_METERS = 15_000;
export const MAX_HOME_NEARBY_CLUBS = 8;

export function isValidGeoPoint(
  point: { lat?: number; lng?: number } | null | undefined,
): point is GeoPoint {
  return (
    point != null &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  );
}

/** First saved favourite or profile coordinate, if any. */
export function originFromUser(user: PublicUser | null): GeoPoint | null {
  if (!user) return null;
  for (const location of user.favouriteLocations ?? []) {
    if (isValidGeoPoint(location.address.point)) {
      return location.address.point;
    }
  }
  return isValidGeoPoint(user.address.point) ? user.address.point : null;
}

export function nearbyClubSubtitle(
  address: string,
  distanceLabel: string,
): string {
  if (distanceLabel) return `${distanceLabel} · ${address}`;
  return address;
}

export function mapDiscoveryClubToNearbyBrowse(
  club: DiscoveryClubPayload,
  origin: GeoPoint,
): BrowseClub {
  const mapped = mapDiscoveryClubToBrowse(club);
  const point = club.location?.point;
  if (!isValidGeoPoint(point)) return mapped;

  const distanceLabel = formatMapDistanceLabel(
    distanceMetersBetween(origin, { lat: point.lat, lng: point.lng }),
  );

  return {
    ...mapped,
    distanceLabel,
    location: nearbyClubSubtitle(mapped.location, distanceLabel),
  };
}

export function readBrowserGeoPosition(): Promise<GeoPoint | null> {
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
