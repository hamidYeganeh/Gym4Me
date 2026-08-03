import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  EXPERT_COACHES,
  FEATURED_COACHES,
  NEARBY_COACHES,
  POPULAR_COACHES,
} from "./coaches-browse-data";
import { MAP_COACHES } from "./map-data";

export type CoachProgramStatus = "done" | "thinking" | "inProgress";

export type CoachDetailProgram = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  status: CoachProgramStatus;
  done: boolean;
};

export type CoachDetailInspo = {
  id: string;
  image: string;
};

export type CoachDetail = {
  id: string;
  name: string;
  specialty: string;
  tagline: string;
  image: string;
  avatar: string;
  availabilityLabel: string;
  nextSessionLabel: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
  membersCount: number;
  progressPercent: number;
  newAddedCount: number;
  inspo: CoachDetailInspo[];
  programs: CoachDetailProgram[];
  price: number;
  pricePrefix: string;
  priceSuffix: string;
};

const PORTRAIT = "/demo/coach-portrait.png";
const GYM = PLACEHOLDER_IMAGE;

const DEFAULT_PROGRAMS: CoachDetailProgram[] = [
  {
    id: "strength",
    title: "برنامه قدرتی",
    subtitle: "۳ جلسه / هفته · پایین‌تنه",
    image: GYM,
    status: "done",
    done: true,
  },
  {
    id: "hiit",
    title: "HIIT فشرده",
    subtitle: "قایق‌سواری · عکاسی ورزشی",
    image: GYM,
    status: "thinking",
    done: false,
  },
  {
    id: "mobility",
    title: "ریکاوری و تحرک",
    subtitle: "تور جزیره · کشش فعال",
    image: GYM,
    status: "inProgress",
    done: false,
  },
  {
    id: "nutrition",
    title: "تغذیه همراه",
    subtitle: "برنامه غذایی ۷ روزه",
    image: GYM,
    status: "thinking",
    done: false,
  },
];

const DEFAULT_INSPO: CoachDetailInspo[] = [
  { id: "i1", image: PORTRAIT },
  { id: "i2", image: GYM },
  { id: "i3", image: PORTRAIT },
];

type CoachSeed = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
};

function collectCoachSeeds(): CoachSeed[] {
  const byId = new Map<string, CoachSeed>();

  for (const coach of FEATURED_COACHES) {
    byId.set(coach.id, {
      id: coach.id,
      name: coach.name,
      specialty: coach.specialty,
      image: coach.image,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      yearsExperience: coach.yearsExperience,
    });
  }

  for (const coach of POPULAR_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      name: coach.name.replace(/^Coach\s+/i, ""),
      specialty: "Fitness Coach",
      image: coach.image,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      yearsExperience: coach.yearsExperience,
    });
  }

  for (const coach of NEARBY_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      name: coach.name.replace(/^Coach\s+/i, ""),
      specialty: coach.specialtyLabel,
      image: coach.image,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      yearsExperience: 5,
    });
  }

  for (const coach of EXPERT_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      name: coach.name,
      specialty: "Expert Coach",
      image: coach.image,
      rating: 4.8,
      ratingCount: 120,
      yearsExperience: 6,
    });
  }

  for (const coach of MAP_COACHES) {
    if (byId.has(coach.id)) continue;
    byId.set(coach.id, {
      id: coach.id,
      name: coach.name.replace(/^Coach\s+/i, ""),
      specialty: coach.specialtyLabel,
      image: coach.image,
      rating: coach.rating,
      ratingCount: coach.ratingCount,
      yearsExperience: 5,
    });
  }

  return [...byId.values()];
}

const COACH_DETAIL_OVERRIDES: Partial<
  Record<string, Partial<Omit<CoachDetail, "id">>>
> = {
  zuckmann: {
    name: "Zuckmann D. Meta",
    specialty: "Lower Body Expert",
    tagline: "تمرین خصوصی با تیم",
    availabilityLabel: "۲۳–۲۸ اردیبهشت",
    nextSessionLabel: "۰۱:۲۳",
    progressPercent: 34,
    newAddedCount: 2,
    membersCount: 6,
  },
  arnold: {
    name: "Arnold Swarznibble",
    specialty: "Cardio Expert",
    tagline: "تمرین خصوصی با تیم",
    availabilityLabel: "۲۳–۲۸ اردیبهشت",
    nextSessionLabel: "۰۱:۲۳",
    progressPercent: 34,
    newAddedCount: 2,
    membersCount: 6,
  },
  "arnold-feat": {
    name: "Arnold Swarznibble",
    specialty: "Upper Body Expert",
    tagline: "قدرت و حجم بالاتنه",
    availabilityLabel: "این هفته",
    nextSessionLabel: "۱۸:۳۰",
  },
  "near-arnold": {
    name: "Arnold Swarznibble",
    specialty: "HIIT Expert",
    tagline: "تمرین فشرده گروهی",
  },
};

function buildCoachDetail(seed: CoachSeed): CoachDetail {
  const override = COACH_DETAIL_OVERRIDES[seed.id] ?? {};

  return {
    id: seed.id,
    name: override.name ?? seed.name,
    specialty: override.specialty ?? seed.specialty,
    tagline: override.tagline ?? "تمرین خصوصی با مربی",
    image: override.image ?? (seed.image || PORTRAIT),
    avatar: override.avatar ?? (seed.image || PORTRAIT),
    availabilityLabel: override.availabilityLabel ?? "این هفته",
    nextSessionLabel: override.nextSessionLabel ?? "۰۹:۰۰",
    rating: override.rating ?? seed.rating,
    ratingCount: override.ratingCount ?? seed.ratingCount,
    yearsExperience: override.yearsExperience ?? seed.yearsExperience,
    membersCount: override.membersCount ?? 6,
    progressPercent: override.progressPercent ?? 34,
    newAddedCount: override.newAddedCount ?? 2,
    inspo: override.inspo ?? DEFAULT_INSPO,
    programs: override.programs ?? DEFAULT_PROGRAMS,
    price: override.price ?? 850_000,
    pricePrefix: override.pricePrefix ?? "",
    priceSuffix: override.priceSuffix ?? "/جلسه",
  };
}

const COACH_DETAILS: CoachDetail[] = collectCoachSeeds().map(buildCoachDetail);

export function getAllCoachIds(): string[] {
  return COACH_DETAILS.map((coach) => coach.id);
}

export function getCoachDetail(coachId: string): CoachDetail | undefined {
  return COACH_DETAILS.find((coach) => coach.id === coachId);
}
