import { statsColors } from "@repo/theme";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  getAllClubIds,
  getClubDetail,
  type ClubDetailAmenity,
  type ClubDetailCoach,
  type ClubDetailEquipment,
  type ClubDetailSport,
} from "./club-detail-data";
import {
  DEFAULT_GALLERY_ITEMS,
  galleryFromImages,
  type GalleryMediaItem,
} from "./gallery-media";

export type ClassDetailInstruction = {
  title: string;
  body: string;
};

export type ClassDetailRelated = {
  id: string;
  category: string;
  title: string;
  image: string;
  durationLabel: string;
  caloriesLabel: string;
};

export type ClassDetailEnrollment = {
  /** Seat price in toman (numeric for sticky CTA NumberFlow). */
  price: number;
  priceSuffix?: string;
};

export type ClassDetail = {
  id: string;
  clubId: string;
  category: string;
  title: string;
  tagline: string;
  /** Optional coach display name for the hero meta row. */
  coachName?: string;
  image: string;
  gallery: GalleryMediaItem[];
  durationLabel: string;
  rating: string;
  caloriesLabel: string;
  description: string;
  benefits: string[];
  tags: string[];
  enrollment: ClassDetailEnrollment;
  coaches: ClubDetailCoach[];
  /** Gear athletes should bring / use for this class. */
  equipment: ClubDetailEquipment[];
  amenities: ClubDetailAmenity[];
  sports: ClubDetailSport[];
  /** Class series progress for the sessions knob chart. */
  sessionProgress: {
    /** Sessions already held. */
    passed: number;
    /** Total sessions in the visible series window. */
    total: number;
    caption: string;
  };
  intensity: {
    score: string;
    label: string;
    description: string;
  };
  instructions: ClassDetailInstruction[];
  planSteps: ClassDetailInstruction[];
  related: ClassDetailRelated[];
  isBookmarked?: boolean;
};

const DEFAULT_GALLERY: GalleryMediaItem[] = DEFAULT_GALLERY_ITEMS.slice(0, 4);
const COACH_PORTRAIT = "/demo/coach-portrait.png";

const CLASS_COACHES = {
  sara: {
    id: "sara",
    name: "سارا محمدی",
    image: COACH_PORTRAIT,
    priceLabel: "از ۸۵۰٬۰۰۰ تومان",
    specialtyLabel: "HIIT",
    distanceLabel: "همین شعبه",
    rating: 4.9,
    ratingCount: 128,
    availability: "in-person" as const,
    yearsExperience: 5,
    isNew: true,
    isCertified: true,
  },
  ali: {
    id: "ali",
    name: "علی رضایی",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "از ۷۲۰٬۰۰۰ تومان",
    specialtyLabel: "قدرتی",
    distanceLabel: "همین شعبه",
    rating: 4.7,
    ratingCount: 96,
    availability: "in-person" as const,
    yearsExperience: 8,
    isCertified: true,
  },
  nika: {
    id: "nika",
    name: "نیکا احمدی",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "از ۶۵۰٬۰۰۰ تومان",
    specialtyLabel: "موبیلیتی",
    distanceLabel: "همین شعبه",
    rating: 4.8,
    ratingCount: 74,
    availability: "in-person" as const,
    yearsExperience: 4,
    isCertified: true,
  },
} satisfies Record<string, ClubDetailCoach>;

const HIIT_EQUIPMENT: ClubDetailEquipment[] = [
  {
    id: "mat",
    title: "مت تمرین",
    subtitle: "ضدلغزش",
    meta: "الزامی",
  },
  {
    id: "rope",
    title: "بتل روپ",
    subtitle: "قدرت و کاردیو",
    meta: "باشگاه",
  },
  {
    id: "kettlebell",
    title: "کتل‌بل",
    subtitle: "وزنه متغیر",
    meta: "باشگاه",
  },
  {
    id: "bike",
    title: "دوچرخه ثابت",
    subtitle: "پایان‌دهنده",
    meta: "اختیاری",
  },
];

const STRENGTH_EQUIPMENT: ClubDetailEquipment[] = [
  {
    id: "rack",
    title: "رک اسکوات",
    subtitle: "پاور رک",
    meta: "باشگاه",
  },
  {
    id: "dumbbell",
    title: "دمبل",
    subtitle: "ست کامل",
    meta: "باشگاه",
  },
  {
    id: "bench",
    title: "نیمکت پرس",
    subtitle: "تخت و شیبدار",
    meta: "باشگاه",
  },
  {
    id: "barbell",
    title: "هالتر المپیک",
    subtitle: "صفحات استاندارد",
    meta: "باشگاه",
  },
];

const CLASS_AMENITIES: ClubDetailAmenity[] = [
  {
    id: "shower",
    title: "دوش و رختکن",
    subtitle: "بعد از کلاس",
    iconKey: "shower",
  },
  {
    id: "locker",
    title: "کمد امن",
    subtitle: "قفل دیجیتال",
    iconKey: "locker",
  },
  {
    id: "ac",
    title: "تهویه مطبوع",
    subtitle: "کنترل دمای سالن",
    iconKey: "ac",
  },
  {
    id: "wifi",
    title: "وای‌فای",
    subtitle: "در فضای تمرین",
    iconKey: "wifi",
  },
];

const HIIT_SPORTS: ClubDetailSport[] = [
  {
    id: "hiit",
    title: "HIIT",
    subtitle: "کالری‌سوزی",
    color: statsColors.orange,
  },
  {
    id: "cardio",
    title: "کاردیو",
    subtitle: "استقامت",
    color: statsColors.red,
  },
  {
    id: "core",
    title: "مرکز بدن",
    subtitle: "قدرت و ثبات",
    color: statsColors.purple,
  },
];

const STRENGTH_SPORTS: ClubDetailSport[] = [
  {
    id: "strength",
    title: "قدرتی",
    subtitle: "تمرین با وزنه",
    color: "oklch(15% 0.02 250)",
  },
  {
    id: "hypertrophy",
    title: "هایپرتروفی",
    subtitle: "عضله‌سازی",
    color: statsColors.blue,
  },
  {
    id: "functional",
    title: "فانکشنال",
    subtitle: "حرکت ترکیبی",
    color: statsColors.orange,
  },
];

const FALLBACK_EQUIPMENT: ClubDetailEquipment[] = [
  {
    id: "mat",
    title: "مت تمرین",
    subtitle: "ضدلغزش",
    meta: "پیشنهادی",
  },
  {
    id: "water",
    title: "بطری آب",
    subtitle: "هیدراته بمانید",
    meta: "الزامی",
  },
  {
    id: "towel",
    title: "حوله",
    subtitle: "شخصی",
    meta: "پیشنهادی",
  },
];

const FALLBACK_SPORTS: ClubDetailSport[] = [
  {
    id: "fitness",
    title: "تناسب اندام",
    subtitle: "عمومی",
    color: statsColors.blue,
  },
];

const CLASSES: Record<string, ClassDetail> = {
  "power-hiit": {
    id: "power-hiit",
    clubId: "heavenly",
    category: "HIIT",
    title: "پاور HIIT با تمرکز شکم",
    tagline: "شدید، مؤثر و نتیجه‌محور — برای نسخه‌ای قوی‌تر از خودت.",
    coachName: "سارا محمدی",
    image: "/demo/coach-portrait.png",
    gallery: DEFAULT_GALLERY,
    durationLabel: "۴۵ دقیقه",
    rating: "۴٫۶",
    caloriesLabel: "۶۴۸ کیلوکالری",
    description:
      "کلاس اینتروال با شدت بالا که کاردیوی انفجاری را با کار متمرکز روی مرکز بدن ترکیب می‌کند. انتظار داشته باشید دوره‌های کوتاه تلاش، ریکاوری هوشمند و پایانی که شما را تیز و پرانرژی نگه می‌دارد.",
    benefits: [
      "سوخت کالری بالا برای کاهش چربی",
      "تقویت قدرت انفجاری و استقامت",
      "تقویت مرکز بدن و وضعیت قامت",
      "قابل تنظیم برای همه سطوح آمادگی",
      "مناسب برنامه‌های شلوغ روزانه",
    ],
    tags: ["HIIT", "مرکز بدن", "چربی‌سوزی", "همه سطوح", "کاردیو"],
    enrollment: {
      price: 350_000,
      priceSuffix: "تومان",
    },
    sessionProgress: {
      passed: 5,
      total: 12,
      caption: "۷ جلسه باقی‌مانده",
    },
    intensity: {
      score: "۸۷٫۲",
      label: "عالی برای چربی‌سوزی",
      description: "این کلاس برای متابولیسم و آمادگی قلبی‌عروقی بسیار مناسب است.",
    },
    instructions: [
      {
        title: "گرم‌کردن و آماده‌سازی",
        body: "با موبیلیتی پویا، کاردیوی سبک و حرکات فعال‌سازی شروع کنید تا ضربان قلب به‌صورت ایمن بالا برود.",
      },
      {
        title: "بلوک‌های اصلی HIIT",
        body: "اینتروال‌های پرشدت را با ریکاوری کوتاه جایگزین کنید. با خستگی، فرم را بر سرعت اولویت دهید.",
      },
      {
        title: "تمرین مرکز بدن و سردکردن",
        body: "با کار هدفمند روی مرکز بدن تمام کنید؛ سپس کشش و تنفس برای پایین آوردن ضربان قلب.",
      },
    ],
    planSteps: [
      {
        title: "بلوک الف — قدرت",
        body: "اسکوات پرشی، بتل روپ و بارپی · ۴۰ ثانیه کار / ۲۰ ثانیه استراحت × ۴",
      },
      {
        title: "بلوک ب — مرکز بدن",
        body: "انواع پلانک، هالوهولد و چرخش روسی · ۳ دور",
      },
      {
        title: "بلوک ج — پایان‌دهنده",
        body: "اسپرینت نردبانی با دوچرخه یا روئینگ، سپس کشش کامل بدن",
      },
    ],
    coaches: [CLASS_COACHES.sara, CLASS_COACHES.nika],
    equipment: HIIT_EQUIPMENT,
    amenities: CLASS_AMENITIES,
    sports: HIIT_SPORTS,
    related: [
      {
        id: "strength-circuit",
        category: "قدرتی",
        title: "سیرکت قدرتی Deluxe",
        image: PLACEHOLDER_IMAGE,
        durationLabel: "۵۰ دقیقه",
        caloriesLabel: "۵۲۰ کیلوکالری",
      },
      {
        id: "mobility-flow",
        category: "موبیلیتی",
        title: "فلوی موبیلیتی",
        image: PLACEHOLDER_IMAGE,
        durationLabel: "۳۰ دقیقه",
        caloriesLabel: "۱۸۰ کیلوکالری",
      },
    ],
    isBookmarked: false,
  },
  "strength-circuit": {
    id: "strength-circuit",
    clubId: "heavenly",
    category: "قدرتی",
    title: "سیرکت قدرتی Deluxe",
    tagline: "حرکات ترکیبی، ریتم هوشمند و اضافه‌بار تدریجی.",
    coachName: "علی رضایی",
    image: PLACEHOLDER_IMAGE,
    gallery: DEFAULT_GALLERY,
    durationLabel: "۵۰ دقیقه",
    rating: "۴٫۸",
    caloriesLabel: "۵۲۰ کیلوکالری",
    description:
      "سیرکت قدرتی مربی‌محور با تمرکز روی الگوهای حرکتی اصلی. عضله بسازید، تکنیک را بهتر کنید و با حس پیشرفت مشخص جلسه را ترک کنید.",
    benefits: [
      "ساخت عضلهٔ خشک به‌صورت مؤثر",
      "بهبود ثبات مفصل‌ها",
      "آموزش فرم صحیح لیفت",
      "ساختار هفتگی پیشرونده",
      "مناسب برنامه‌های شلوغ",
    ],
    tags: ["قدرتی", "هالتر", "هایپرتروفی", "باشگاه", "مربی‌محور"],
    enrollment: {
      price: 420_000,
      priceSuffix: "تومان",
    },
    sessionProgress: {
      passed: 8,
      total: 10,
      caption: "۲ جلسه باقی‌مانده",
    },
    intensity: {
      score: "۸۲٫۴",
      label: "مناسب عضله‌سازی",
      description: "شدت متعادل برای قدرت، بدون خستگی بیش از حد.",
    },
    instructions: [
      {
        title: "آماده‌سازی حرکتی",
        body: "فوم‌رول، فعال‌سازی باسن و شانه، سپس تمرین الگوها با هالتر خالی.",
      },
      {
        title: "دورهای سیرکت",
        body: "بین ایستگاه‌های اسکوات، hinge، پرس و کشش با تمپوی کنترل‌شده بچرخید.",
      },
      {
        title: "اکسسوری و کشش",
        body: "با اکسسوری دست/مرکز بدن و موبیلیتی کوتاه جلسه را تمام کنید.",
      },
    ],
    planSteps: [
      {
        title: "ایستگاه ۱ — اسکوات",
        body: "گابلت یا بک اسکوات · ۴ × ۸ با ۶۰ ثانیه استراحت",
      },
      {
        title: "ایستگاه ۲ — کشش",
        body: "لت‌پول‌داون یا رو · ۴ × ۱۰ با تکرار کنترل‌شده",
      },
      {
        title: "ایستگاه ۳ — فشار",
        body: "پرس سینه یا شنا · ۴ × ۸–۱۲ تا نزدیک ناتوانی",
      },
    ],
    coaches: [CLASS_COACHES.ali, CLASS_COACHES.sara],
    equipment: STRENGTH_EQUIPMENT,
    amenities: CLASS_AMENITIES,
    sports: STRENGTH_SPORTS,
    related: [
      {
        id: "power-hiit",
        category: "HIIT",
        title: "پاور HIIT با تمرکز شکم",
        image: "/demo/coach-portrait.png",
        durationLabel: "۴۵ دقیقه",
        caloriesLabel: "۶۴۸ کیلوکالری",
      },
    ],
    isBookmarked: true,
  },
};

function titleFromClassId(classId: string): string {
  return classId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createFallbackClass(clubId: string, classId: string): ClassDetail {
  const club = getClubDetail(clubId);
  const title = titleFromClassId(classId) || `کلاس ${classId}`;
  const clubTitle = club?.title ?? "این باشگاه";

  return {
    id: classId,
    clubId,
    category: "تناسب اندام",
    title,
    tagline: "تمرین مربی‌محور برای پیشرفت واقعی.",
    image: club?.images[0] ?? PLACEHOLDER_IMAGE,
    gallery: club?.images?.length
      ? galleryFromImages(club.images)
      : DEFAULT_GALLERY,
    durationLabel: "۳۰ تا ۴۵ دقیقه",
    rating: "۴٫۵",
    caloriesLabel: "۴۰۰ کیلوکالری",
    description: `در کلاس ${title} در ${clubTitle} شرکت کنید — برنامه‌نویسی ساختاریافته، مربیگری حرفه‌ای و فضایی پرانرژی.`,
    benefits: [
      "مربیگری حرفه‌ای و اصلاح فرم",
      "ساختار جلسه شفاف",
      "شدت قابل تنظیم",
      "فضای حمایتی گروهی",
      "رزرو و حضور آسان",
    ],
    tags: ["تناسب اندام", "کلاس باشگاه", "مربی", "تمرین"],
    enrollment: {
      price: 280_000,
      priceSuffix: "تومان",
    },
    sessionProgress: {
      passed: 3,
      total: 8,
      caption: "۵ جلسه باقی‌مانده",
    },
    intensity: {
      score: "۸۰٫۰",
      label: "شدت متعادل",
      description: "کلاسی متعادل برای استمرار و پیشرفت پایدار.",
    },
    instructions: [
      {
        title: "ورود و گرم‌کردن",
        body: "زودتر چک‌این کنید، فضای خود را آماده کنید و گرم‌کردن راهنما را انجام دهید.",
      },
      {
        title: "جلسه اصلی",
        body: "با راهنمایی مربی، بلوک‌های تمرینی اصلی را دنبال کنید.",
      },
      {
        title: "سردکردن",
        body: "کشش کنید، آب بنوشید و پیشرفت‌های جلسه را یادداشت کنید.",
      },
    ],
    planSteps: [
      {
        title: "گرم‌کردن",
        body: "۵ تا ۸ دقیقه موبیلیتی و فعال‌سازی.",
      },
      {
        title: "ست‌های کاری",
        body: "بلوک تمرینی اصلی با استراحت برنامه‌ریزی‌شده.",
      },
      {
        title: "پایان‌دهنده",
        body: "کندیشنینگ اختیاری به‌همراه کشش سردکردن.",
      },
    ],
    coaches: club?.coaches?.slice(0, 2) ?? [CLASS_COACHES.sara],
    equipment: FALLBACK_EQUIPMENT,
    amenities: CLASS_AMENITIES,
    sports: FALLBACK_SPORTS,
    related: [
      {
        id: "power-hiit",
        category: "HIIT",
        title: "پاور HIIT با تمرکز شکم",
        image: "/demo/coach-portrait.png",
        durationLabel: "۴۵ دقیقه",
        caloriesLabel: "۶۴۸ کیلوکالری",
      },
    ],
    isBookmarked: false,
  };
}

export function getClassDetail(
  clubId: string,
  classId: string,
): ClassDetail | undefined {
  const club = clubId.trim();
  const id = classId.trim();
  if (!club || !id) return undefined;

  const known = CLASSES[id];
  if (known) {
    return { ...known, clubId: club };
  }

  return createFallbackClass(club, id);
}

/** Pairs for Capacitor static export (`output: "export"`). */
export function getAllClassParams(): { clubId: string; classId: string }[] {
  const fromKnown = Object.values(CLASSES).map((item) => ({
    clubId: item.clubId,
    classId: item.id,
  }));

  const clubIds = getAllClubIds();
  const extras = clubIds.flatMap((clubId) =>
    Object.keys(CLASSES).map((classId) => ({ clubId, classId })),
  );

  const seen = new Set<string>();
  const all = [...fromKnown, ...extras];
  return all.filter((item) => {
    const key = `${item.clubId}/${item.classId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
