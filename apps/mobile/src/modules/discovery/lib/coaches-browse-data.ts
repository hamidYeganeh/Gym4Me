import type { AchievementTagColor } from "@repo/ui/cards/AchievementTag";

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

export type MapCoach = {
  id: string;
  name: string;
  image: string;
  specialtyLabel: string;
  rating: number;
  ratingCount: number;
  address: string;
};

/** Filter chip that deep-links into coaches browse. */
export type CoachFeatureItem = {
  id: string;
  title: string;
  color: AchievementTagColor;
  iconKey:
    | "remote"
    | "inPerson"
    | "certified"
    | "new"
    | "hiit"
    | "yoga"
    | "strength"
    | "mobility";
  href: string;
};

const PORTRAIT = "/demo/coach-portrait.png";

export const COACH_SPECIALTIES: CoachSpecialty[] = [
  { id: "hiit", label: "کراس‌فیت" },
  { id: "strength", label: "قدرتی" },
  { id: "yoga", label: "یوگا" },
  { id: "speed", label: "دویدن" },
  { id: "mobility", label: "پیلاتس" },
];

export const COACH_FEATURE_ITEMS: CoachFeatureItem[] = [
  {
    id: "remote",
    title: "آنلاین",
    color: "blue",
    iconKey: "remote",
    href: "/discovery/coaches?availability=remote",
  },
  {
    id: "in-person",
    title: "حضوری",
    color: "orange",
    iconKey: "inPerson",
    href: "/discovery/coaches?availability=in-person",
  },
  {
    id: "certified",
    title: "تأییدشده",
    color: "success",
    iconKey: "certified",
    href: "/discovery/coaches?verified=1",
  },
  {
    id: "new",
    title: "جدید",
    color: "purple",
    iconKey: "new",
    href: "/discovery/coaches?fresh=1",
  },
  {
    id: "hiit",
    title: "کراس‌فیت",
    color: "red",
    iconKey: "hiit",
    href: "/discovery/coaches?coachType=crossfit",
  },
  {
    id: "yoga",
    title: "یوگا",
    color: "accent",
    iconKey: "yoga",
    href: "/discovery/coaches?coachType=yoga",
  },
  {
    id: "strength",
    title: "قدرتی",
    color: "warning",
    iconKey: "strength",
    href: "/discovery/coaches?coachType=strength-training",
  },
  {
    id: "mobility",
    title: "پیلاتس",
    color: "yellow",
    iconKey: "mobility",
    href: "/discovery/coaches?coachType=pilates",
  },
];

export const FEATURED_COACHES: FeaturedCoach[] = [
  {
    id: "zuckmann",
    name: "Zuckmann D. Meta",
    specialty: "متخصص پایین‌تنه",
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
    specialty: "متخصص بالاتنه",
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
    specialty: "متخصص HIIT",
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
    specialty: "متخصص موبیلیتی",
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
    image: PORTRAIT,
    rating: 4.8,
    ratingCount: 287,
    yearsExperience: 5,
  },
  {
    id: "analene",
    name: "Coach Analene Brown",
    image: PORTRAIT,
    rating: 4.9,
    ratingCount: 312,
    yearsExperience: 7,
  },
  {
    id: "jennie",
    name: "Coach Jennie Kim",
    image: PORTRAIT,
    rating: 4.7,
    ratingCount: 198,
    yearsExperience: 4,
  },
  {
    id: "lisa",
    name: "Coach Lisa Manoban",
    image: PORTRAIT,
    rating: 4.6,
    ratingCount: 176,
    yearsExperience: 6,
  },
  {
    id: "rose",
    name: "Coach Roseanne Park",
    image: PORTRAIT,
    rating: 4.8,
    ratingCount: 245,
    yearsExperience: 5,
  },
];

export const EXPERT_COACHES: ExpertCoach[] = [
  { id: "exp-jeanette", name: "Jeanette Pink", image: PORTRAIT, isVerified: true },
  { id: "exp-analene", name: "Analene Brown", image: PORTRAIT, isVerified: true },
  { id: "exp-jennie", name: "Jennie Kim", image: PORTRAIT, isVerified: true },
  { id: "exp-lisa", name: "Lisa Manoban", image: PORTRAIT, isVerified: true },
  { id: "exp-rose", name: "Roseanne Park", image: PORTRAIT, isVerified: true },
  { id: "exp-jisoo", name: "Jisoo Kim", image: PORTRAIT, isVerified: true },
];

export const NEARBY_COACHES: NearbyCoach[] = [
  {
    id: "near-arnold",
    name: "Coach Arnold Swarznibble",
    image: PORTRAIT,
    priceLabel: "از ۸۵۰ هزار تومان",
    specialtyId: "hiit",
    specialtyLabel: "متخصص HIIT",
    distanceLabel: "۵۰۰ متر",
    rating: 4.5,
    ratingCount: 300,
    availability: "remote",
  },
  {
    id: "near-zuckmann",
    name: "Coach Zuckmann D. Meta",
    image: PORTRAIT,
    priceLabel: "از ۱٫۲ میلیون تومان",
    specialtyId: "strength",
    specialtyLabel: "متخصص قدرتی",
    distanceLabel: "۱٫۲ کیلومتر",
    rating: 4.2,
    ratingCount: 180,
    availability: "in-person",
  },
  {
    id: "near-jeanette",
    name: "Coach Jeanette Pink",
    image: PORTRAIT,
    priceLabel: "از ۹۵۰ هزار تومان",
    specialtyId: "yoga",
    specialtyLabel: "متخصص یوگا",
    distanceLabel: "۸۰۰ متر",
    rating: 4.8,
    ratingCount: 240,
    availability: "remote",
  },
  {
    id: "near-analene",
    name: "Coach Analene Brown",
    image: PORTRAIT,
    priceLabel: "از ۱ میلیون تومان",
    specialtyId: "mobility",
    specialtyLabel: "متخصص موبیلیتی",
    distanceLabel: "۱٫۵ کیلومتر",
    rating: 4.9,
    ratingCount: 188,
    availability: "in-person",
  },
];

export const MAP_COACHES: MapCoach[] = [
  {
    id: "map-arnold",
    name: "Arnold Swarznibble",
    image: PORTRAIT,
    specialtyLabel: "HIIT",
    rating: 4.5,
    ratingCount: 300,
    address: "تهران، سعادت‌آباد",
  },
  {
    id: "map-jeanette",
    name: "Jeanette Pink",
    image: PORTRAIT,
    specialtyLabel: "یوگا",
    rating: 4.8,
    ratingCount: 240,
    address: "تهران، ونک",
  },
  {
    id: "map-analene",
    name: "Analene Brown",
    image: PORTRAIT,
    specialtyLabel: "موبیلیتی",
    rating: 4.9,
    ratingCount: 188,
    address: "تهران، جردن",
  },
];

export const DEFAULT_COACH_CITY_NAME = "تهران";

export function sortFeaturedByRating(coaches: FeaturedCoach[]): FeaturedCoach[] {
  return [...coaches].sort((a, b) => b.rating - a.rating);
}

export function sortPopularByRating(coaches: PopularCoach[]): PopularCoach[] {
  return [...coaches].sort((a, b) => b.rating - a.rating);
}

export function featuredNewCoaches(coaches: FeaturedCoach[]): FeaturedCoach[] {
  const tagged = coaches.filter((coach) => coach.isNew);
  return tagged.length > 0 ? tagged : coaches.slice(0, 4);
}

export function featuredCertifiedCoaches(
  coaches: FeaturedCoach[],
): FeaturedCoach[] {
  const tagged = coaches.filter((coach) => coach.isCertified);
  return tagged.length > 0 ? tagged : coaches;
}

export function nearbyRemoteCoaches(coaches: NearbyCoach[]): NearbyCoach[] {
  return coaches.filter((coach) => coach.availability === "remote");
}

export function nearbyInPersonCoaches(coaches: NearbyCoach[]): NearbyCoach[] {
  return coaches.filter((coach) => coach.availability === "in-person");
}

export function mapCoachesFromNearby(coaches: NearbyCoach[]): MapCoach[] {
  return coaches.slice(0, 6).map((coach) => ({
    id: `map-${coach.id}`,
    name: coach.name,
    image: coach.image,
    specialtyLabel: coach.specialtyLabel,
    rating: coach.rating,
    ratingCount: coach.ratingCount,
    address: coach.distanceLabel
      ? `${coach.distanceLabel} · نزدیک شما`
      : "موقعیت نامشخص",
  }));
}

/** Flat browse row used by the clubs-parity coaches list screen. */
export type BrowseCoach = {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  ratingCount: number;
  price: string;
  featureLabels: string[];
  specialtyIds: CoachSpecialtyId[];
  distanceLabel: string;
  availability: "remote" | "in-person" | "hybrid";
  isCertified?: boolean;
  isNew?: boolean;
};

function specialtyIdFromLabel(label: string): CoachSpecialtyId | null {
  const normalized = label.toLowerCase();
  if (/hiit/.test(normalized)) return "hiit";
  if (/یوگا|yoga/.test(normalized)) return "yoga";
  if (/قدر|strength|بالاتنه|پایین/.test(normalized)) return "strength";
  if (/موبیل|mobil/.test(normalized)) return "mobility";
  if (/سرعت|speed/.test(normalized)) return "speed";
  return null;
}

function buildBrowseCoaches(): BrowseCoach[] {
  const byId = new Map<string, BrowseCoach>();

  for (const coach of FEATURED_COACHES) {
    const specialtyId = specialtyIdFromLabel(coach.specialty);
    byId.set(coach.id, {
      id: coach.id,
      title: coach.name,
      location: "تهران",
      image: coach.image || PORTRAIT,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      price: "۸۵۰ هزار",
      featureLabels: [
        coach.specialty,
        ...(coach.isCertified ? ["تأییدشده"] : []),
        ...(coach.isNew ? ["جدید"] : []),
      ],
      specialtyIds: specialtyId ? [specialtyId] : ["strength"],
      distanceLabel: "۱٫۵ کیلومتر",
      availability: "hybrid",
      isCertified: coach.isCertified,
      isNew: coach.isNew,
    });
  }

  for (const coach of NEARBY_COACHES) {
    const existing = byId.get(coach.id);
    if (existing) {
      byId.set(coach.id, {
        ...existing,
        location: existing.location,
        price: coach.priceLabel.replace(/^از\s*/, "").replace(/\s*تومان$/, "") || existing.price,
        distanceLabel: coach.distanceLabel || existing.distanceLabel,
        availability: coach.availability,
        specialtyIds: [coach.specialtyId],
        featureLabels: Array.from(
          new Set([...existing.featureLabels, coach.specialtyLabel]),
        ),
      });
      continue;
    }
    byId.set(coach.id, {
      id: coach.id,
      title: coach.name.replace(/^Coach\s+/i, ""),
      location: "تهران",
      image: coach.image || PORTRAIT,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      price: coach.priceLabel.replace(/^از\s*/, "").replace(/\s*تومان$/, "") || "۸۵۰ هزار",
      featureLabels: [
        coach.specialtyLabel,
        coach.availability === "remote" ? "آنلاین" : "حضوری",
      ],
      specialtyIds: [coach.specialtyId],
      distanceLabel: coach.distanceLabel,
      availability: coach.availability,
    });
  }

  for (const coach of POPULAR_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      title: coach.name.replace(/^Coach\s+/i, ""),
      location: "تهران",
      image: coach.image || PORTRAIT,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      price: "۷۵۰ هزار",
      featureLabels: ["محبوب"],
      specialtyIds: ["hiit"],
      distanceLabel: "۲ کیلومتر",
      availability: "hybrid",
    });
  }

  for (const coach of EXPERT_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      title: coach.name,
      location: "تهران",
      image: coach.image || PORTRAIT,
      rating: 4.8,
      ratingCount: 120,
      price: "۹۰۰ هزار",
      featureLabels: ["متخصص", ...(coach.isVerified ? ["تأییدشده"] : [])],
      specialtyIds: ["strength"],
      distanceLabel: "۲٫۵ کیلومتر",
      availability: "hybrid",
      isCertified: coach.isVerified,
    });
  }

  return [...byId.values()];
}

export const BROWSE_COACHES: BrowseCoach[] = buildBrowseCoaches();

export function sortCoachesByRating(coaches: BrowseCoach[]): BrowseCoach[] {
  return [...coaches].sort((a, b) => b.rating - a.rating);
}

export function coachesNearby(coaches: BrowseCoach[]): BrowseCoach[] {
  return [...coaches].sort((a, b) => {
    const da = Number.parseFloat(
      a.distanceLabel.replace(/[^\d./]/g, "").replace("/", "."),
    );
    const db = Number.parseFloat(
      b.distanceLabel.replace(/[^\d./]/g, "").replace("/", "."),
    );
    return (Number.isFinite(da) ? da : 99) - (Number.isFinite(db) ? db : 99);
  });
}

export function coachesAvailableRemote(coaches: BrowseCoach[]): BrowseCoach[] {
  return coaches.filter(
    (coach) =>
      coach.availability === "remote" || coach.availability === "hybrid",
  );
}

export function coachesAvailableInPerson(coaches: BrowseCoach[]): BrowseCoach[] {
  return coaches.filter(
    (coach) =>
      coach.availability === "in-person" || coach.availability === "hybrid",
  );
}

export function filterBrowseCoaches(
  coaches: BrowseCoach[],
  filterId: string,
): BrowseCoach[] {
  switch (filterId) {
    case "remote":
      return coachesAvailableRemote(coaches);
    case "in-person":
      return coachesAvailableInPerson(coaches);
    case "certified":
      return coaches.filter((coach) => coach.isCertified);
    case "new":
      return coaches.filter((coach) => coach.isNew);
    case "hiit":
    case "yoga":
    case "strength":
    case "mobility":
      return coaches.filter((coach) =>
        coach.specialtyIds.includes(filterId as CoachSpecialtyId),
      );
    default:
      return coaches;
  }
}
