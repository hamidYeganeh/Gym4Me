const PORTRAIT = "/demo/coach-portrait.png";

export type MapCoach = {
  id: string;
  name: string;
  image: string;
  specialtyLabel: string;
  rating: number;
  ratingCount: number;
  address: string;
  lat: number;
  lng: number;
  /** Distance from the user in meters (when geo is known). */
  distanceMeters?: number;
  /** Localized distance chip (e.g. "۵۰۰ متر"). */
  distanceLabel?: string;
  /** Defaults to coach detail route when omitted. */
  detailsHref?: string;
  /** Verified club / coach badge on the map card. */
  verified?: boolean;
};

/** Sample coaches around Laleh Park / Keshavarz Blvd, Tehran. */
export const MAP_COACHES: MapCoach[] = [
  {
    id: "arnold",
    name: "آرنولد شوارزنبل",
    image: PORTRAIT,
    specialtyLabel: "تخصص کاردیو",
    rating: 4.5,
    ratingCount: 1587,
    address: "باشگاه شوارزنبل، تهران",
    lat: 35.7148,
    lng: 51.3942,
    distanceMeters: 500,
    distanceLabel: "۵۰۰ متر",
    verified: true,
  },
  {
    id: "jeanette",
    name: "ژانت پینک",
    image: PORTRAIT,
    specialtyLabel: "تخصص قدرتی",
    rating: 4.8,
    ratingCount: 287,
    address: "استودیو پینک، خیابان ولیعصر، تهران",
    lat: 35.7186,
    lng: 51.3898,
    distanceMeters: 1200,
    distanceLabel: "۱٫۲ کیلومتر",
    verified: true,
  },
  {
    id: "zuckmann",
    name: "زاکمن متا",
    image: PORTRAIT,
    specialtyLabel: "تخصص HIIT",
    rating: 3.5,
    ratingCount: 90,
    address: "متا فیت هاب، میدان فاطمی، تهران",
    lat: 35.7112,
    lng: 51.3985,
    distanceMeters: 850,
    distanceLabel: "۸۵۰ متر",
  },
];

export const DEFAULT_SELECTED_COACH_ID = MAP_COACHES[0]!.id;

export function getMapCoach(id: string): MapCoach | undefined {
  return MAP_COACHES.find((coach) => coach.id === id);
}

/** Haversine distance in meters. */
export function distanceMetersBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Compact Persian distance label for map chips. */
export function formatMapDistanceLabel(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "";
  if (meters < 1000) {
    const rounded = Math.max(50, Math.round(meters / 50) * 50);
    return `${rounded.toLocaleString("fa-IR")} متر`;
  }
  const km = meters / 1000;
  const rounded = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
  const label = Number.isInteger(rounded)
    ? rounded.toLocaleString("fa-IR")
    : rounded.toLocaleString("fa-IR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
  return `${label} کیلومتر`;
}

export function withMapDistances(
  coaches: readonly MapCoach[],
  origin: { lat: number; lng: number },
): MapCoach[] {
  return coaches
    .map((coach) => {
      const meters = distanceMetersBetween(origin, coach);
      return {
        ...coach,
        distanceMeters: meters,
        distanceLabel: formatMapDistanceLabel(meters),
      };
    })
    .sort(
      (a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity),
    );
}

export function pickNearestMapCoachId(
  coaches: readonly MapCoach[],
): string | undefined {
  let nearest: MapCoach | undefined;
  for (const coach of coaches) {
    if (coach.distanceMeters == null) continue;
    if (
      nearest?.distanceMeters == null ||
      coach.distanceMeters < nearest.distanceMeters
    ) {
      nearest = coach;
    }
  }
  return nearest?.id ?? coaches[0]?.id;
}
