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
    name: "Coach Arnold Swarznibble",
    image: PORTRAIT,
    specialtyLabel: "Cardio Expert",
    rating: 4.5,
    ratingCount: 1587,
    address: "Swarznibble Gym, 221b Elementary Street, Tehran",
    lat: 35.7148,
    lng: 51.3942,
  },
  {
    id: "jeanette",
    name: "Coach Jeanette Pink",
    image: PORTRAIT,
    specialtyLabel: "Strength Expert",
    rating: 4.8,
    ratingCount: 287,
    address: "Pink Strength Studio, Valiasr St, Tehran",
    lat: 35.7186,
    lng: 51.3898,
  },
  {
    id: "zuckmann",
    name: "Zuckmann D. Meta",
    image: PORTRAIT,
    specialtyLabel: "HIIT Expert",
    rating: 3.5,
    ratingCount: 90,
    address: "Meta Fit Hub, Fatemi Sq, Tehran",
    lat: 35.7112,
    lng: 51.3985,
  },
];

export const DEFAULT_SELECTED_COACH_ID = MAP_COACHES[0]!.id;

export function getMapCoach(id: string): MapCoach | undefined {
  return MAP_COACHES.find((coach) => coach.id === id);
}
