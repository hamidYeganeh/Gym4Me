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
  /** Defaults to coach detail route when omitted. */
  detailsHref?: string;
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
  },
];

export const DEFAULT_SELECTED_COACH_ID = MAP_COACHES[0]!.id;

export function getMapCoach(id: string): MapCoach | undefined {
  return MAP_COACHES.find((coach) => coach.id === id);
}
