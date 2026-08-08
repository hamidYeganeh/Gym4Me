import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type CoachSpecialtyId =
  | "hiit"
  | "strength"
  | "yoga"
  | "speed"
  | "mobility";

export type CoachSpecialty = {
  id: string;
  label: string;
};

export type FeaturedCoach = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
  isNew?: boolean;
  isCertified?: boolean;
};

export type PopularCoach = {
  id: string;
  name: string;
  image: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
};

export type ExpertCoach = {
  id: string;
  name: string;
  image: string;
  isVerified?: boolean;
};

export type NearbyCoach = {
  id: string;
  name: string;
  image: string;
  priceLabel: string;
  specialtyId: CoachSpecialtyId;
  specialtyLabel: string;
  distanceLabel: string;
  rating: number;
  ratingCount: number;
  availability: "remote" | "in-person";
};

const PORTRAIT = "/demo/coach-portrait.png";

export const COACH_SPECIALTIES: CoachSpecialty[] = [
  { id: "hiit", label: "HIIT" },
  { id: "strength", label: "Strength" },
  { id: "yoga", label: "Yoga" },
  { id: "speed", label: "Speed" },
  { id: "mobility", label: "Mobility" },
];

export const FEATURED_COACHES: FeaturedCoach[] = [
  {
    id: "zuckmann",
    name: "Zuckmann D. Meta",
    specialty: "Lower Body Expert",
    image: PORTRAIT,
    rating: 3.5,
    ratingCount: 90,
    yearsExperience: 5,
    isNew: true,
    isCertified: true,
  },
  {
    id: "arnold-feat",
    name: "Arnold Swarznibble",
    specialty: "Upper Body Expert",
    image: PORTRAIT,
    rating: 4.8,
    ratingCount: 210,
    yearsExperience: 8,
    isNew: true,
    isCertified: true,
  },
  {
    id: "jeanette-feat",
    name: "Jeanette Pink",
    specialty: "HIIT Expert",
    image: PORTRAIT,
    rating: 4.6,
    ratingCount: 154,
    yearsExperience: 5,
    isNew: false,
    isCertified: true,
  },
  {
    id: "analene-feat",
    name: "Analene Brown",
    specialty: "Mobility Expert",
    image: PORTRAIT,
    rating: 4.9,
    ratingCount: 188,
    yearsExperience: 7,
    isNew: true,
    isCertified: true,
  },
];

export const POPULAR_COACHES: PopularCoach[] = [
  {
    id: "jeanette",
    name: "Coach Jeanette Pink",
    image: PLACEHOLDER_IMAGE,
    rating: 4.8,
    ratingCount: 287,
    yearsExperience: 5,
  },
  {
    id: "analene",
    name: "Coach Analene Brown",
    image: PLACEHOLDER_IMAGE,
    rating: 4.9,
    ratingCount: 312,
    yearsExperience: 7,
  },
  {
    id: "jennie",
    name: "Coach Jennie Kim",
    image: PLACEHOLDER_IMAGE,
    rating: 4.7,
    ratingCount: 198,
    yearsExperience: 4,
  },
  {
    id: "lisa",
    name: "Coach Lisa Manoban",
    image: PLACEHOLDER_IMAGE,
    rating: 4.6,
    ratingCount: 176,
    yearsExperience: 6,
  },
  {
    id: "rose",
    name: "Coach Roseanne Park",
    image: PLACEHOLDER_IMAGE,
    rating: 4.8,
    ratingCount: 245,
    yearsExperience: 5,
  },
];

export const EXPERT_COACHES: ExpertCoach[] = [
  { id: "exp-jeanette", name: "Jeanette Pink", image: PLACEHOLDER_IMAGE },
  { id: "exp-analene", name: "Analene Brown", image: PLACEHOLDER_IMAGE },
  { id: "exp-jennie", name: "Jennie Kim", image: PLACEHOLDER_IMAGE },
  { id: "exp-lisa", name: "Lisa Manoban", image: PLACEHOLDER_IMAGE },
  { id: "exp-rose", name: "Roseanne Park", image: PLACEHOLDER_IMAGE },
  { id: "exp-jisoo", name: "Jisoo Kim", image: PLACEHOLDER_IMAGE },
];

export const NEARBY_COACHES: NearbyCoach[] = [
  {
    id: "near-arnold",
    name: "Coach Arnold Swarznibble",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "$100 - $250/session",
    specialtyId: "hiit",
    specialtyLabel: "HIIT Expert",
    distanceLabel: "500m",
    rating: 4.5,
    ratingCount: 300,
    availability: "remote",
  },
  {
    id: "near-zuckmann",
    name: "Coach Zuckmann D. Meta",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "$120 - $280/session",
    specialtyId: "strength",
    specialtyLabel: "Strength Expert",
    distanceLabel: "1.2km",
    rating: 4.2,
    ratingCount: 180,
    availability: "in-person",
  },
  {
    id: "near-jeanette",
    name: "Coach Jeanette Pink",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "$90 - $200/session",
    specialtyId: "yoga",
    specialtyLabel: "Yoga Expert",
    distanceLabel: "800m",
    rating: 4.8,
    ratingCount: 240,
    availability: "remote",
  },
];
