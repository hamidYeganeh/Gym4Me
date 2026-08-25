import { statsColors } from "@repo/theme/stats-colors";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  EXPERT_COACHES,
  FEATURED_COACHES,
  NEARBY_COACHES,
  POPULAR_COACHES,
} from "./coaches-browse-data";
import type { GalleryMediaItem } from "./gallery-media";
import { MAP_COACHES } from "./map-data";

export type CoachDetailStatKey = "years" | "students" | "sessions";

export type CoachDetailStat = {
  labelKey: CoachDetailStatKey;
  value: string;
};

export type CoachDetailSpecialty = {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  color?: string;
};

export type CoachDetailServiceIconKey =
  | "online"
  | "inPerson"
  | "nutrition"
  | "program"
  | "assessment"
  | "group";

export type CoachDetailService = {
  id: string;
  title: string;
  subtitle?: string;
  iconKey: CoachDetailServiceIconKey;
};

export type CoachDetailAvailabilitySlotStatus = "available" | "unavailable";

export type CoachDetailAvailabilitySlot = {
  id: string;
  timeLabel: string;
  status: CoachDetailAvailabilitySlotStatus;
};

export type CoachDetailConsultationKind = "in-person" | "remote";

export type CoachDetailConsultationAvailabilityStatus =
  | "available"
  | "unavailable";

export type CoachDetailConsultationType = {
  id: string;
  kind: CoachDetailConsultationKind;
  /** Translation key under CoachDetail for the title. */
  titleKey: "consultationInPerson" | "consultationRemote";
  status: CoachDetailConsultationAvailabilityStatus;
  /** Translation key under CoachDetail for the status line. */
  statusKey: "consultationAvailableToday" | "consultationNotAvailable";
  /** Numeric price used for display formatting. */
  price: number;
};

export type CoachDetailAvailabilityDay = {
  id: string;
  /** Relative day key — body section resolves the display label. */
  dayKey: "today" | "tomorrow";
  /** Optional short date for tomorrow labels, e.g. `۲ تیر`. */
  dateLabel?: string;
  slots: CoachDetailAvailabilitySlot[];
};

export type CoachDetailPackage = {
  id: string;
  /** Translation key under CoachDetail, e.g. `packageTrial`. */
  planNameKey: "packageTrial" | "packageSingle" | "packageMonthly";
  /** Translation key under CoachDetail for the plan blurb. */
  descriptionKey:
    | "packageTrialDescription"
    | "packageSingleDescription"
    | "packageMonthlyDescription";  /** Numeric price used by NumberFlow in the reserve bar. */
  price: number;
  /** Optional promo badge (e.g. "۲۰٪"). */
  badge?: string;
};

export type CoachDetailClub = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
};

export type CoachDetailReview = {
  id: string;
  title: string;
  content: string;
  date: string;
  rating: number;
  avatar?: string;
  avatarFallback?: string;
  isVerified?: boolean;
};

export type CoachDetailRelated = {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  yearsExperience: number;
};

export type CoachDetailExperienceMilestone = {
  id: string;
  year: string;
  title: string;
  description: string;
};

export type CoachDetailExperience = {
  summary: string;
  milestones: CoachDetailExperienceMilestone[];
};

export type CoachDetail = {
  id: string;
  name: string;
  specialty: string;
  tagline: string;
  location: string;
  images: string[];
  gallery: GalleryMediaItem[];
  avatar: string;
  availability: "remote" | "in-person" | "hybrid";
  availabilityLabel: string;
  rating: number;
  ratingCount: number;
  yearsExperience: number;
  stats: CoachDetailStat[];
  overview: string;
  experience: CoachDetailExperience;
  services: CoachDetailService[];
  specialties: CoachDetailSpecialty[];
  consultationTypes: CoachDetailConsultationType[];
  packages: CoachDetailPackage[];
  availabilityDays: CoachDetailAvailabilityDay[];
  clubs: CoachDetailClub[];
  reviews: CoachDetailReview[];
  related: CoachDetailRelated[];
  pricePrefix: string;
  priceSuffix: string;
  isFavorite?: boolean;
  isVerified?: boolean;
};

const PORTRAIT = "/demo/coach-portrait.png";

/** Hero carousel photos for a coach (portrait-first, like club venue images). */
function coachHeroImages(primary: string): string[] {
  const hero = primary || PORTRAIT;
  // Demo only has one portrait asset — repeat so the hero carousel matches club UX.
  return [hero, hero, hero];
}

const DEFAULT_STATS: CoachDetailStat[] = [
  { labelKey: "years", value: "۸" },
  { labelKey: "students", value: "۱۲۴" },
  { labelKey: "sessions", value: "۱٫۲k" },
];

const DEFAULT_SERVICES: CoachDetailService[] = [
  {
    id: "online",
    title: "جلسه آنلاین",
    subtitle: "ویدیو کال زنده",
    iconKey: "online",
  },
  {
    id: "in-person",
    title: "جلسه حضوری",
    subtitle: "در باشگاه یا فضای باز",
    iconKey: "inPerson",
  },
  {
    id: "program",
    title: "برنامه تمرینی",
    subtitle: "سفارشی‌سازی هفتگی",
    iconKey: "program",
  },
  {
    id: "nutrition",
    title: "تغذیه همراه",
    subtitle: "پلن غذایی ۷ روزه",
    iconKey: "nutrition",
  },
  {
    id: "assessment",
    title: "ارزیابی بدن",
    subtitle: "آنالیز اولیه رایگان",
    iconKey: "assessment",
  },
  {
    id: "group",
    title: "تمرین گروهی",
    subtitle: "تا ۴ نفر",
    iconKey: "group",
  },
];

const DEFAULT_SPECIALTIES: CoachDetailSpecialty[] = [
  {
    id: "lower",
    title: "پایین‌تنه",
    subtitle: "تخصص اصلی",
    color: statsColors.orange,
  },
  {
    id: "strength",
    title: "قدرتی",
    subtitle: "هایپرتروفی",
    color: "oklch(15% 0.02 250)",
  },
  {
    id: "hiit",
    title: "HIIT",
    subtitle: "کالری‌سوزی",
    color: statsColors.red,
  },
  {
    id: "mobility",
    title: "موبیلیتی",
    subtitle: "ریکاوری فعال",
    color: statsColors.purple,
  },
];

const DEFAULT_CONSULTATION_TYPES: CoachDetailConsultationType[] = [
  {
    id: "in-person",
    kind: "in-person",
    titleKey: "consultationInPerson",
    status: "available",
    statusKey: "consultationAvailableToday",
    price: 200_000,
  },
  {
    id: "remote",
    kind: "remote",
    titleKey: "consultationRemote",
    status: "unavailable",
    statusKey: "consultationNotAvailable",
    price: 100_000,
  },
];

const DEFAULT_PACKAGES: CoachDetailPackage[] = [
  {
    id: "trial",
    planNameKey: "packageTrial",
    descriptionKey: "packageTrialDescription",
    price: 0,
  },
  {
    id: "single",
    planNameKey: "packageSingle",
    descriptionKey: "packageSingleDescription",
    price: 850_000,
    badge: "۲۰٪",
  },
  {
    id: "monthly",
    planNameKey: "packageMonthly",
    descriptionKey: "packageMonthlyDescription",
    price: 2_800_000,
    badge: "۱۵٪",
  },
];

const DEFAULT_AVAILABILITY_DAYS: CoachDetailAvailabilityDay[] = [
  {
    id: "today",
    dayKey: "today",
    slots: [
      { id: "today-10", timeLabel: "۱۰:۰۰", status: "available" },
      { id: "today-11", timeLabel: "۱۱:۰۰", status: "unavailable" },
      { id: "today-12", timeLabel: "۱۲:۰۰", status: "available" },
      { id: "today-13", timeLabel: "۱۳:۰۰", status: "available" },
      { id: "today-14", timeLabel: "۱۴:۰۰", status: "unavailable" },
    ],
  },
  {
    id: "tomorrow",
    dayKey: "tomorrow",
    dateLabel: "۲ تیر",
    slots: [
      { id: "tomorrow-10", timeLabel: "۱۰:۰۰", status: "available" },
      { id: "tomorrow-11", timeLabel: "۱۱:۰۰", status: "unavailable" },
      { id: "tomorrow-12", timeLabel: "۱۲:۰۰", status: "unavailable" },
      { id: "tomorrow-13", timeLabel: "۱۳:۰۰", status: "available" },
      { id: "tomorrow-15", timeLabel: "۱۵:۰۰", status: "available" },
    ],
  },
];

const DEFAULT_CLUBS: CoachDetailClub[] = [
  {
    id: "heavenly",
    title: "آسمانی",
    subtitle: "ونک، تهران",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "iron",
    title: "آیرون هاوس",
    subtitle: "جردن، تهران",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "pulse",
    title: "پالس فیت",
    subtitle: "سعادت‌آباد",
    image: PLACEHOLDER_IMAGE,
  },
];

const DEFAULT_REVIEWS: CoachDetailReview[] = [
  {
    id: "r1",
    title: "سارا محمدی",
    content:
      "برنامه دقیقشون واقعاً نتیجه داد. جلسات آنلاین هم کیفیت حضوری رو دارن.",
    date: "۳ خرداد ۱۴۰۴",
    rating: 5,
    avatarFallback: "سم",
    isVerified: true,
  },
  {
    id: "r2",
    title: "علی رضایی",
    content:
      "تخصص پایین‌تنه عالی بود. پیگیری بین جلسه‌ها منظم و حرفه‌ایه.",
    date: "۲۸ اردیبهشت ۱۴۰۴",
    rating: 4.5,
    avatarFallback: "عر",
    isVerified: true,
  },
  {
    id: "r3",
    title: "نیکا احمدی",
    content:
      "تغذیه همراه خیلی کمک کرد. توضیح حرکات واضح و بدون فشار اضافیه.",
    date: "۱۵ اردیبهشت ۱۴۰۴",
    rating: 5,
    avatarFallback: "نا",
    isVerified: true,
  },
  {
    id: "r4",
    title: "مهدی کریمی",
    content: "پکیج ماهانه ارزشش رو داره. پیشرفت اندازه‌گیری‌شده و قابل پیگیریه.",
    date: "۲ اردیبهشت ۱۴۰۴",
    rating: 4,
    avatarFallback: "مک",
    isVerified: false,
  },
];

const DEFAULT_OVERVIEW =
  "مربی تأییدشده با تمرکز روی قدرت پایین‌تنه، هایپرتروفی و ریکاوری فعال. برنامه‌ها بر اساس سطح، تجهیزات در دسترس و هدف شما شخصی‌سازی می‌شن — حضوری در باشگاه‌های همکار یا آنلاین از خانه.";

const DEFAULT_EXPERIENCE: CoachDetailExperience = {
  summary:
    "با بیش از ۱۵ سال تجربه، مربی آرنولد به مراجعانش در بدنسازی، رشد عضله و موارد بیشتر کمک کرده است.",
  milestones: [
    {
      id: "harvard",
      year: "۲۰۲۰",
      title: "مدرسه تناسب‌اندام هاروارد",
      description: "۷ سال تحصیل",
    },
    {
      id: "united",
      year: "۲۰۲۳",
      title: "یونایتد فیتنس",
      description: "سپس ۱۰ سال کار در باشگاه",
    },
    {
      id: "own-gym",
      year: "۲۰۲۶",
      title: "افتتاح باشگاه شخصی",
      description: "در نهایت افتتاح باشگاه خودم",
    },
  ],
};

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
      specialty: "مربی تناسب‌اندام",
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
      specialty: "مربی متخصص",
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
    name: "زاکمن متا",
    specialty: "تخصص پایین‌تنه",
    tagline: "قدرت، هایپرتروفی و ریکاوری هدفمند",
    location: "تهران · ونک",
    availability: "hybrid",
    availabilityLabel: "حضوری و آنلاین",
    isVerified: true,
    isFavorite: true,
  },
  arnold: {
    name: "آرنولد شوارزنبل",
    specialty: "تمرین قدرتی و بدنسازی",
    tagline: "برنامه‌های سخت‌گیرانه با تمرکز روی قدرت و هایپرتروفی",
    location: "تهران · جردن",
    availability: "hybrid",
    availabilityLabel: "حضوری و آنلاین",
    isVerified: true,
    rating: 4.8,
    ratingCount: 240,
    yearsExperience: 15,
  },
  "arnold-feat": {
    name: "آرنولد شوارزنبل",
    specialty: "تخصص بالاتنه",
    tagline: "قدرت و حجم بالاتنه",
    location: "تهران · سعادت‌آباد",
    availability: "hybrid",
    availabilityLabel: "حضوری و آنلاین",
  },
  "near-arnold": {
    name: "آرنولد شوارزنبل",
    specialty: "تخصص HIIT",
    tagline: "تمرین فشرده گروهی",
    location: "تهران · مرکز",
    availability: "remote",
    availabilityLabel: "فقط آنلاین",
  },
};

function relatedFor(seedId: string, seeds: CoachSeed[]): CoachDetailRelated[] {
  return seeds
    .filter((seed) => seed.id !== seedId)
    .slice(0, 4)
    .map((seed) => ({
      id: seed.id,
      name: COACH_DETAIL_OVERRIDES[seed.id]?.name ?? seed.name,
      specialty: COACH_DETAIL_OVERRIDES[seed.id]?.specialty ?? seed.specialty,
      image: seed.image || PORTRAIT,
      rating: seed.rating,
      yearsExperience: seed.yearsExperience,
    }));
}

function buildCoachDetail(seed: CoachSeed, seeds: CoachSeed[]): CoachDetail {
  const override = COACH_DETAIL_OVERRIDES[seed.id] ?? {};
  const hero = override.images?.[0] ?? override.avatar ?? (seed.image || PORTRAIT);
  const images = override.images ?? coachHeroImages(hero);
  const gallery =
    override.gallery ??
    images.map((url, index) => ({
      id: `coach-photo-${index + 1}`,
      url,
      title: index === 0 ? "پرتره مربی" : `عکس مربی ${index + 1}`,
      mediaKind: "image" as const,
      author: override.name ?? seed.name,
    }));

  return {
    id: seed.id,
    name: override.name ?? seed.name,
    specialty: override.specialty ?? seed.specialty,
    tagline: override.tagline ?? "تمرین خصوصی با مربی تأییدشده",
    location: override.location ?? "تهران",
    images,
    gallery,
    avatar: override.avatar ?? hero,
    availability: override.availability ?? "hybrid",
    availabilityLabel: override.availabilityLabel ?? "حضوری و آنلاین",
    rating: override.rating ?? seed.rating,
    ratingCount: override.ratingCount ?? seed.ratingCount,
    yearsExperience: override.yearsExperience ?? seed.yearsExperience,
    stats: override.stats ?? [
      {
        labelKey: "years",
        value: String(override.yearsExperience ?? seed.yearsExperience).replace(
          /\d/g,
          (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit,
        ),
      },
      ...DEFAULT_STATS.slice(1),
    ],
    overview: override.overview ?? DEFAULT_OVERVIEW,
    experience: override.experience ?? DEFAULT_EXPERIENCE,
    services: override.services ?? DEFAULT_SERVICES,
    specialties: override.specialties ?? DEFAULT_SPECIALTIES,
    consultationTypes:
      override.consultationTypes ?? DEFAULT_CONSULTATION_TYPES,
    packages: override.packages ?? DEFAULT_PACKAGES,
    availabilityDays: override.availabilityDays ?? DEFAULT_AVAILABILITY_DAYS,
    clubs: override.clubs ?? DEFAULT_CLUBS,
    reviews: override.reviews ?? DEFAULT_REVIEWS,
    related: override.related ?? relatedFor(seed.id, seeds),
    pricePrefix: override.pricePrefix ?? "از",
    priceSuffix: override.priceSuffix ?? "تومان",
    isFavorite: override.isFavorite ?? false,
    isVerified: override.isVerified ?? true,
  };
}

const COACH_SEEDS = collectCoachSeeds();
const COACH_DETAILS: CoachDetail[] = COACH_SEEDS.map((seed) =>
  buildCoachDetail(seed, COACH_SEEDS),
);

export function getAllCoachIds(): string[] {
  return COACH_DETAILS.map((coach) => coach.id);
}

export function getCoachDetail(coachId: string): CoachDetail | undefined {
  return COACH_DETAILS.find((coach) => coach.id === coachId);
}
