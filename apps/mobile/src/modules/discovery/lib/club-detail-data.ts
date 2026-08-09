import { statsColors } from "@repo/theme";
import type { ClubRouteMapLatLng } from "@repo/ui/cards/ClubRouteMapCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import {
  DEFAULT_GALLERY_ITEMS,
  galleryFromImages,
  type GalleryMediaItem,
} from "./gallery-media";

export type {
  GalleryMediaItem as ClubDetailGalleryItem,
  GalleryMediaKind as ClubDetailGalleryMediaKind,
} from "./gallery-media";
export {
  formatGalleryViews,
  withGalleryCardDefaults,
} from "./gallery-media";

export type ClubDetailStatKey = "distance" | "score" | "students";

export type ClubDetailStat = {
  labelKey: ClubDetailStatKey;
  value: string;
};

export type ClubDetailSport = {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  color?: string;
};

export type ClubDetailEquipment = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
};

export type ClubDetailAmenityIconKey =
  | "wifi"
  | "parking"
  | "shower"
  | "locker"
  | "ac"
  | "cafe";

export type ClubDetailAmenity = {
  id: string;
  title: string;
  subtitle?: string;
  iconKey: ClubDetailAmenityIconKey;
};

export type ClubDetailCoach = {
  id: string;
  name: string;
  image: string;
  priceLabel: string;
  specialtyLabel: string;
  distanceLabel: string;
  rating: number;
  ratingCount: number;
  availability: "remote" | "in-person";
  yearsExperience?: number;
  /** Show the "New" badge on the feature card. */
  isNew?: boolean;
  /** Show certified / verified meta. */
  isCertified?: boolean;
};

export type ClubDetailBranch = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
};

export type ClubDetailClassPreview = {
  id: string;
  category: string;
  date: string;
  title: string;
  author: string;
  duration: string;
  backgroundImage?: string;
};

export type ClubDetailLocation = {
  title: string;
  /** Province / استان */
  province?: string;
  /** City / شهر */
  city?: string;
  /** Neighborhood / محله */
  neighborhood?: string;
  /** Full address line fallback. */
  address?: string;
  duration?: string;
  calories?: string;
  distanceLabel?: string;
  startLabel?: string;
  endLabel?: string;
  route: readonly ClubRouteMapLatLng[];
};

export type ClubDetailPhone = {
  id: string;
  number: string;
  label?: string;
};

export type ClubDetailOperatingHourAudience = "shared" | "male" | "female";

export type ClubDetailOperatingHour = {
  weekday: number;
  status: "open" | "closed";
  /** Defaults to `shared` when omitted. */
  audience?: ClubDetailOperatingHourAudience;
  open?: string;
  close?: string;
  description?: string;
};

export type ClubDetailRule = {
  id: string;
  policy: "required" | "recommended" | "prohibited";
  title: string;
  description?: string;
};

export type ClubDetailCategory = {
  id: string;
  title: string;
};

export type ClubDetailAchievement = {
  id: string;
  title: string;
  color?:
    | "accent"
    | "danger"
    | "success"
    | "warning"
    | "red"
    | "orange"
    | "blue"
    | "yellow"
    | "purple";
};

export type ClubDetailFaq = {
  id: string;
  title: string;
  description: string;
};

export type ClubDetailAudience = {
  genderPolicy?: string;
  ageGroupKeys: string[];
  levelKeys: string[];
  accessibility: string;
};

export type ClubDetailOwner = {
  id: string;
  name: string;
  avatar?: string;
  headline?: string;
  /** Optional short bio shown in the owner details sheet. */
  bio?: string;
  /** Years of experience. */
  yearsExperience?: number;
  rating?: number;
  ratingCount?: number;
  /** Optional rank badge overlaid on the avatar. */
  rank?: number;
};

export type ClubDetailSubscription = {
  id: string;
  /** Translation key under ClubDetail, e.g. `planFree`. */
  planNameKey: "planFree" | "planBasic" | "planPremium";
  /** Translation key under ClubDetail for the plan blurb. */
  descriptionKey:
    | "planFreeDescription"
    | "planBasicDescription"
    | "planPremiumDescription";
  /** Numeric price used by NumberFlow in the reserve bar. */
  price: number;
  /** Optional promo badge (e.g. "۵۰٪"). */
  badge?: string;
};

export type ClubDetailReview = {
  id: string;
  title: string;
  content: string;
  date: string;
  rating: number;
  avatar?: string;
  avatarFallback?: string;
  isVerified?: boolean;
};

/** Relative busyness for a time-of-day bucket (0–100). */
export type ClubDetailBusyHour = {
  label: string;
  value: number;
};

export type ClubDetail = {
  id: string;
  title: string;
  location: string;
  /** e.g. "۰۶:۰۰ – ۲۳:۰۰" */
  openHoursLabel: string;
  /** Whether the club is currently open (demo flag). */
  isOpen: boolean;
  images: string[];
  gallery: GalleryMediaItem[];
  stats: ClubDetailStat[];
  overview: string;
  pricePrefix: string;
  price: string;
  priceSuffix: string;
  subscriptions: ClubDetailSubscription[];
  amenities: ClubDetailAmenity[];
  sports: ClubDetailSport[];
  equipment: ClubDetailEquipment[];
  coaches: ClubDetailCoach[];
  locationCard: ClubDetailLocation;
  branches: ClubDetailBranch[];
  classes: ClubDetailClassPreview[];
  reviews: ClubDetailReview[];
  /** Typical crowd level across the day (hour labels). */
  busyHours: ClubDetailBusyHour[];
  phones: ClubDetailPhone[];
  operatingHours: ClubDetailOperatingHour[];
  rules: ClubDetailRule[];
  categories: ClubDetailCategory[];
  achievements: ClubDetailAchievement[];
  faq: ClubDetailFaq[];
  audience: ClubDetailAudience;
  owner?: ClubDetailOwner;
  isFavorite?: boolean;
  isSaved?: boolean;
};

const DEFAULT_IMAGES = [
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
] as const;

const TEHRAN_ROUTE: ClubRouteMapLatLng[] = [
  { lat: 35.7089, lng: 51.3912 },
  { lat: 35.7118, lng: 51.3948 },
  { lat: 35.7142, lng: 51.3915 },
  { lat: 35.7176, lng: 51.3962 },
  { lat: 35.7201, lng: 51.3924 },
  { lat: 35.7228, lng: 51.3981 },
  { lat: 35.7254, lng: 51.3945 },
];

const DEFAULT_SPORTS: ClubDetailSport[] = [
  {
    id: "kickboxing",
    title: "کیک‌بوکسینگ",
    subtitle: "تمرین پیش‌رو",
    color: statsColors.red,
  },
  {
    id: "strength",
    title: "قدرتی",
    subtitle: "تمرین با وزنه",
    // Fixed dark fill so default stats-foreground text stays readable in both themes.
    color: "oklch(15% 0.02 250)",
  },
  {
    id: "yoga",
    title: "یوگا",
    subtitle: "آرامش و انعطاف",
    color: statsColors.purple,
  },
  {
    id: "hiit",
    title: "HIIT",
    subtitle: "کالری‌سوزی",
    color: statsColors.orange,
  },
];

const COACH_PORTRAIT = "/demo/coach-portrait.png";

const DEFAULT_AMENITIES: ClubDetailAmenity[] = [
  {
    id: "wifi",
    title: "وای‌فای",
    subtitle: "پرسرعت در کل سالن",
    iconKey: "wifi",
  },
  {
    id: "parking",
    title: "پارکینگ",
    subtitle: "ظرفیت محدود رایگان",
    iconKey: "parking",
  },
  {
    id: "shower",
    title: "دوش و رختکن",
    subtitle: "کابین اختصاصی",
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
    id: "cafe",
    title: "کافه ورزشی",
    subtitle: "پروتئین و نوشیدنی",
    iconKey: "cafe",
  },
];

const DEFAULT_COACHES: ClubDetailCoach[] = [
  {
    id: "sara",
    name: "سارا محمدی",
    image: COACH_PORTRAIT,
    priceLabel: "از ۸۵۰٬۰۰۰ تومان",
    specialtyLabel: "HIIT",
    distanceLabel: "همین شعبه",
    rating: 4.9,
    ratingCount: 128,
    availability: "in-person",
    yearsExperience: 5,
    isNew: true,
    isCertified: true,
  },
  {
    id: "ali",
    name: "علی رضایی",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "از ۷۲۰٬۰۰۰ تومان",
    specialtyLabel: "قدرتی",
    distanceLabel: "همین شعبه",
    rating: 4.7,
    ratingCount: 96,
    availability: "in-person",
    yearsExperience: 8,
    isCertified: true,
  },
  {
    id: "nika",
    name: "نیکا احمدی",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "از ۶۵۰٬۰۰۰ تومان",
    specialtyLabel: "یوگا",
    distanceLabel: "آنلاین",
    rating: 4.8,
    ratingCount: 74,
    availability: "remote",
    yearsExperience: 4,
    isCertified: true,
  },
  {
    id: "mehdi",
    name: "مهدی کریمی",
    image: PLACEHOLDER_IMAGE,
    priceLabel: "از ۹۰۰٬۰۰۰ تومان",
    specialtyLabel: "اسپینینگ",
    distanceLabel: "همین شعبه",
    rating: 4.6,
    ratingCount: 61,
    availability: "in-person",
    yearsExperience: 6,
    isCertified: true,
  },
];

const DEFAULT_EQUIPMENT: ClubDetailEquipment[] = [
  {
    id: "treadmill",
    title: "تردمیل",
    subtitle: "مدل پرو ایکس",
    meta: "۴ عدد",
  },
  {
    id: "rack",
    title: "رک اسکوات",
    subtitle: "پاور رک",
    meta: "۶ عدد",
  },
  {
    id: "bike",
    title: "دوچرخه ثابت",
    subtitle: "اسپینینگ",
    meta: "۸ عدد",
  },
  {
    id: "cable",
    title: "کراس اور",
    subtitle: "کابل دوبل",
    meta: "۲ عدد",
  },
  {
    id: "dumbbell",
    title: "دمبل",
    subtitle: "ست کامل",
    meta: "۱۲ جفت",
  },
  {
    id: "rower",
    title: "روئینگ",
    subtitle: "مفهومی",
    meta: "۳ عدد",
  },
  {
    id: "bench",
    title: "نیمکت پرس",
    subtitle: "تخت و شیب‌دار",
    meta: "۵ عدد",
  },
];

const DEFAULT_BRANCHES: ClubDetailBranch[] = [
  {
    id: "vanak",
    title: "ونک",
    subtitle: "تهران",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "saadat",
    title: "سعادت‌آباد",
    subtitle: "تهران",
    image: PLACEHOLDER_IMAGE,
  },
  {
    id: "jordan",
    title: "جردن",
    subtitle: "تهران",
    image: PLACEHOLDER_IMAGE,
  },
];

const DEFAULT_CLASSES: ClubDetailClassPreview[] = [
  {
    id: "power-hiit",
    category: "HIIT",
    date: "پنجشنبه، ۲۵ خرداد",
    title: "پاور HIIT با تمرکز شکم",
    author: "سارا محمدی",
    duration: "۴۵ دقیقه",
    backgroundImage: "/demo/coach-portrait.png",
  },
  {
    id: "strength-circuit",
    category: "قدرتی",
    date: "شنبه، ۲۷ خرداد",
    title: "سیرکت قدرتی Deluxe",
    author: "علی رضایی",
    duration: "۵۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "mobility-flow",
    category: "موبیلیتی",
    date: "یکشنبه، ۲۸ خرداد",
    title: "فلوی موبیلیتی",
    author: "نیکا احمدی",
    duration: "۳۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "spin-burn",
    category: "اسپینینگ",
    date: "دوشنبه، ۲۹ خرداد",
    title: "اسپین برن",
    author: "مهدی کریمی",
    duration: "۴۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "yoga-restore",
    category: "یوگا",
    date: "سه‌شنبه، ۳۰ خرداد",
    title: "یوگای ریستور",
    author: "مریم حسینی",
    duration: "۵۵ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "boxing-basics",
    category: "بوکس",
    date: "چهارشنبه، ۳۱ خرداد",
    title: "مبانی بوکس",
    author: "رضا نوری",
    duration: "۴۵ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
];

const DEFAULT_LOCATION: ClubDetailLocation = {
  title: "مسیر باشگاه",
  province: "تهران",
  city: "تهران",
  neighborhood: "ونک",
  address: "تهران، ونک، خیابان ملاصدرا",
  duration: "۴۰ دقیقه",
  calories: "۱۵۰ کالری",
  distanceLabel: "۷٫۲ کیلومتر",
  startLabel: "شروع",
  endLabel: "پایان",
  route: TEHRAN_ROUTE,
};

const DEFAULT_GALLERY: GalleryMediaItem[] = DEFAULT_GALLERY_ITEMS;

const DEFAULT_PHONES: ClubDetailPhone[] = [
  { id: "main", number: "۰۲۱-۸۸۷۷۶۶۵۵", label: "پذیرش" },
  { id: "support", number: "۰۹۱۲-۱۲۳۴۵۶۷", label: "پشتیبانی" },
];

const DEFAULT_OPERATING_HOURS: ClubDetailOperatingHour[] = [
  { weekday: 0, status: "open", audience: "shared", open: "۰۶:۰۰", close: "۲۳:۰۰" },
  { weekday: 1, status: "open", audience: "shared", open: "۰۶:۰۰", close: "۲۳:۰۰" },
  { weekday: 2, status: "open", audience: "shared", open: "۰۶:۰۰", close: "۲۳:۰۰" },
  { weekday: 3, status: "open", audience: "shared", open: "۰۶:۰۰", close: "۲۳:۰۰" },
  { weekday: 4, status: "open", audience: "shared", open: "۰۶:۰۰", close: "۲۳:۰۰" },
  { weekday: 5, status: "open", audience: "shared", open: "۰۷:۰۰", close: "۲۲:۰۰" },
  { weekday: 6, status: "closed", audience: "shared" },
];

/** Mixed club with gender-split schedule (demo). */
const GENDER_SPLIT_OPERATING_HOURS: ClubDetailOperatingHour[] = [
  { weekday: 0, status: "open", audience: "male", open: "۰۶:۰۰", close: "۱۴:۰۰" },
  { weekday: 1, status: "open", audience: "male", open: "۰۶:۰۰", close: "۱۴:۰۰" },
  { weekday: 2, status: "open", audience: "male", open: "۰۶:۰۰", close: "۱۴:۰۰" },
  { weekday: 3, status: "open", audience: "male", open: "۰۶:۰۰", close: "۱۴:۰۰" },
  { weekday: 4, status: "open", audience: "male", open: "۰۶:۰۰", close: "۱۴:۰۰" },
  { weekday: 5, status: "open", audience: "male", open: "۰۷:۰۰", close: "۱۴:۰۰" },
  { weekday: 6, status: "closed", audience: "male" },
  { weekday: 0, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۳:۰۰" },
  { weekday: 1, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۳:۰۰" },
  { weekday: 2, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۳:۰۰" },
  { weekday: 3, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۳:۰۰" },
  { weekday: 4, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۳:۰۰" },
  { weekday: 5, status: "open", audience: "female", open: "۱۴:۰۰", close: "۲۲:۰۰" },
  { weekday: 6, status: "closed", audience: "female" },
];

const DEFAULT_RULES: ClubDetailRule[] = [
  {
    id: "towel",
    policy: "required",
    title: "همراه داشتن حوله",
    description: "برای استفاده از دستگاه‌ها همراه داشتن حوله الزامی است.",
  },
  {
    id: "shoes",
    policy: "required",
    title: "کفش ورزشی تمیز",
    description: "ورود با کفش خیابانی به سالن مجاز نیست.",
  },
  {
    id: "photo",
    policy: "prohibited",
    title: "عکاسی بدون اجازه",
    description: "فیلم‌برداری از سایر اعضا بدون رضایت آن‌ها ممنوع است.",
  },
  {
    id: "water",
    policy: "recommended",
    title: "بطری آب شخصی",
    description: "برای حفظ بهداشت، بطری آب شخصی پیشنهاد می‌شود.",
  },
];

const DEFAULT_CATEGORIES: ClubDetailCategory[] = [
  { id: "gym", title: "باشگاه بدنسازی" },
  { id: "group", title: "کلاس گروهی" },
  { id: "recovery", title: "ریکاوری" },
  { id: "premium", title: "پریمیوم" },
];

const DEFAULT_ACHIEVEMENTS: ClubDetailAchievement[] = [
  { id: "top-rated", title: "برترین امتیاز منطقه", color: "warning" },
  { id: "verified", title: "باشگاه تأییدشده", color: "success" },
  { id: "clean", title: "بهداشت ممتاز", color: "blue" },
  { id: "coach", title: "مربیان حرفه‌ای", color: "purple" },
];

const DEFAULT_FAQ: ClubDetailFaq[] = [
  {
    id: "trial",
    title: "آیا جلسه آزمایشی دارید؟",
    description:
      "بله، برای اعضای جدید یک جلسه آزمایشی رایگان در ساعات غیر اوج قابل رزرو است.",
  },
  {
    id: "parking",
    title: "پارکینگ دارید؟",
    description: "پارکینگ اختصاصی با ظرفیت محدود در طبقه منفی یک موجود است.",
  },
  {
    id: "freeze",
    title: "امکان فریز عضویت هست؟",
    description: "عضویت را تا ۱۴ روز در هر دوره می‌توانید فریز کنید.",
  },
];

const DEFAULT_AUDIENCE: ClubDetailAudience = {
  genderPolicy: "mixed",
  ageGroupKeys: ["adults", "teens"],
  levelKeys: ["beginner", "intermediate", "advanced"],
  accessibility: "accessible",
};

const DEFAULT_OWNER: ClubDetailOwner = {
  id: "owner-1",
  name: "کیانوش مرادی",
  avatar: PLACEHOLDER_IMAGE,
  headline: "مالک و مدیر باشگاه",
  bio: "بیش از یک دهه مدیریت باشگاه‌های ورزشی در تهران؛ تمرکز روی تجربه اعضا، مربیان حرفه‌ای و برنامه‌های تمرینی متنوع.",
  yearsExperience: 5,
  rating: 4.5,
  ratingCount: 257,
  rank: 1,
};

function clubExtras() {
  return {
    gallery: DEFAULT_GALLERY,
    phones: DEFAULT_PHONES,
    operatingHours: DEFAULT_OPERATING_HOURS,
    rules: DEFAULT_RULES,
    categories: DEFAULT_CATEGORIES,
    achievements: DEFAULT_ACHIEVEMENTS,
    faq: DEFAULT_FAQ,
    audience: DEFAULT_AUDIENCE,
    owner: DEFAULT_OWNER,
  };
}

const DEFAULT_SUBSCRIPTIONS: ClubDetailSubscription[] = [
  {
    id: "free",
    planNameKey: "planFree",
    descriptionKey: "planFreeDescription",
    price: 0,
  },
  {
    id: "basic",
    planNameKey: "planBasic",
    descriptionKey: "planBasicDescription",
    price: 700_000,
    badge: "۲۰٪",
  },
  {
    id: "premium",
    planNameKey: "planPremium",
    descriptionKey: "planPremiumDescription",
    price: 1_200_000,
    badge: "۵۰٪",
  },
];

/** Mock typical-day busyness — hour buckets across open hours, value 0–100. */
const DEFAULT_BUSY_HOURS: ClubDetailBusyHour[] = [
  { label: "۶", value: 28 },
  { label: "۹", value: 45 },
  { label: "۱۲", value: 62 },
  { label: "۱۵", value: 38 },
  { label: "۱۸", value: 92 },
  { label: "۲۱", value: 74 },
  { label: "۲۳", value: 40 },
];

const DEFAULT_REVIEWS: ClubDetailReview[] = [
  {
    id: "r1",
    title: "سارا محمدی",
    content:
      "فضای باشگاه عالی و تمیزه. مربی‌ها حرفه‌ای‌ان و برنامه‌ها دقیق اجرا می‌شن. حتماً دوباره می‌ام.",
    date: "۳ خرداد ۱۴۰۴",
    rating: 5,
    avatarFallback: "سم",
    isVerified: true,
  },
  {
    id: "r2",
    title: "علی رضایی",
    content:
      "تجهیزات کامل و به‌روزه. فقط در ساعت اوج شلوغه، ولی در کل تجربه خیلی خوبی داشتم.",
    date: "۲۸ اردیبهشت ۱۴۰۴",
    rating: 4.5,
    avatarFallback: "عر",
    isVerified: true,
  },
  {
    id: "r3",
    title: "نیکا احمدی",
    content:
      "کلاس‌های گروهی انرژی بالایی دارن. رختکن و دوش‌ها تمیز نگه داشته می‌شن.",
    date: "۱۵ اردیبهشت ۱۴۰۴",
    rating: 4,
    avatarFallback: "نا",
    isVerified: true,
  },
  {
    id: "r4",
    title: "مهدی کریمی",
    content:
      "پلن ویژه ارزشش رو داره. دسترسی به مربی اختصاصی واقعاً فرقمون رو رقم زد.",
    date: "۲ اردیبهشت ۱۴۰۴",
    rating: 5,
    avatarFallback: "مک",
    isVerified: false,
  },
  {
    id: "r5",
    title: "مریم حسینی",
    content:
      "موقعیت مکانی عالیه و پارکینگ راحت پیدا می‌شه. فضای یوگا آروم و دلنشینه.",
    date: "۲۰ فروردین ۱۴۰۴",
    rating: 4.5,
    avatarFallback: "مح",
    isVerified: true,
  },
  {
    id: "r6",
    title: "رضا نوری",
    content:
      "برای تمرین قدرتی محیط خیلی مناسبیه. رک‌ها و وزنه‌های آزاد به اندازه کافیه.",
    date: "۵ فروردین ۱۴۰۴",
    rating: 4,
    avatarFallback: "رن",
    isVerified: true,
  },
  {
    id: "r7",
    title: "پریسا کاظمی",
    content:
      "پشتیبانی و پذیرش خیلی مودب و سریع بودن. اپ رزرو هم ساده کار می‌کنه.",
    date: "۱۸ اسفند ۱۴۰۳",
    rating: 5,
    avatarFallback: "پک",
    isVerified: true,
  },
];

const LONG_OVERVIEW =
  "باشگاهی چندطبقه با پلتفرم‌های وزنه‌برداری المپیک، سوئیت ریکاوری و کلاس‌های مربی‌محور. تجهیزات سطح جهانی، برنامه‌نویسی دقیق و جامعه‌ای که شما را به اوج عملکرد می‌رساند. از سالن کاردیو تا فضای فانکشنال و اتاق یوگا، همه چیز برای تمرین هدفمند آماده است. مربیان مجرب همراه شما هستند تا فرم حرکت را اصلاح کنند و برنامه شخصی‌سازی‌شده ارائه دهند.";

const CLUBS: Record<string, ClubDetail> = {
  heavenly: {
    id: "heavenly",
    title: "آسمانی فیتنس",
    location: "تهران، ونک",
    openHoursLabel: "آقایان ۰۶:۰۰ – ۱۴:۰۰ · بانوان ۱۴:۰۰ – ۲۳:۰۰",
    isOpen: true,
    images: [...DEFAULT_IMAGES],
    ...clubExtras(),
    operatingHours: GENDER_SPLIT_OPERATING_HOURS,
    stats: [
      { labelKey: "distance", value: "۱٫۲ کیلومتر" },
      { labelKey: "score", value: "+۵" },
      { labelKey: "students", value: "۱۲۴" },
    ],
    overview: LONG_OVERVIEW,
    pricePrefix: "از",
    price: "۷۰۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: DEFAULT_SUBSCRIPTIONS,
    amenities: DEFAULT_AMENITIES,
    sports: DEFAULT_SPORTS,
    equipment: DEFAULT_EQUIPMENT,
    coaches: DEFAULT_COACHES,
    locationCard: DEFAULT_LOCATION,
    branches: DEFAULT_BRANCHES,
    classes: DEFAULT_CLASSES,
    reviews: DEFAULT_REVIEWS,
    busyHours: DEFAULT_BUSY_HOURS,
    isFavorite: false,
    isSaved: false,
  },
  iron: {
    id: "iron",
    title: "آیرون پارادایس",
    location: "اصفهان، جلفا",
    openHoursLabel: "۰۵:۳۰ – ۲۲:۳۰",
    isOpen: true,
    images: [...DEFAULT_IMAGES],
    ...clubExtras(),
    stats: [
      { labelKey: "distance", value: "۲٫۴ کیلومتر" },
      { labelKey: "score", value: "+۴" },
      { labelKey: "students", value: "۸۶" },
    ],
    overview:
      "باشگاهی قدرت‌محور برای لیفترهای جدی. وزنه‌های آزاد سنگین، رک‌های اختصاصی و مربیان متخصص در اورلود پیشرونده و فرم صحیح حرکت. فضای متمرکز، بدون حواس‌پرتی، فقط تمرین واقعی.",
    pricePrefix: "از",
    price: "۵۵۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: [
      DEFAULT_SUBSCRIPTIONS[0],
      { ...DEFAULT_SUBSCRIPTIONS[1], price: 550_000 },
      { ...DEFAULT_SUBSCRIPTIONS[2], price: 950_000 },
    ],
    amenities: DEFAULT_AMENITIES.slice(0, 4),
    sports: DEFAULT_SPORTS.slice(0, 3),
    equipment: DEFAULT_EQUIPMENT.slice(0, 5),
    coaches: DEFAULT_COACHES.slice(0, 3),
    locationCard: {
      ...DEFAULT_LOCATION,
      title: "مسیر آیرون پارادایس",
      city: "اصفهان",
      neighborhood: "جلفا",
      province: "اصفهان",
      address: "اصفهان، جلفا",
    },
    branches: DEFAULT_BRANCHES.slice(0, 2),
    classes: DEFAULT_CLASSES.slice(0, 4),
    reviews: DEFAULT_REVIEWS.slice(0, 6),
    busyHours: [
      { label: "۶", value: 35 },
      { label: "۹", value: 70 },
      { label: "۱۲", value: 48 },
      { label: "۱۵", value: 28 },
      { label: "۱۸", value: 95 },
      { label: "۲۱", value: 82 },
      { label: "۲۳", value: 55 },
    ],
    isFavorite: true,
    isSaved: true,
  },
  "123": {
    id: "123",
    title: "باشگاه ۱۲۳",
    location: "تهران، سعادت‌آباد",
    openHoursLabel: "۰۷:۰۰ – ۲۲:۰۰",
    isOpen: false,
    images: [...DEFAULT_IMAGES],
    ...clubExtras(),
    stats: [
      { labelKey: "distance", value: "۳٫۸ کیلومتر" },
      { labelKey: "score", value: "+۳" },
      { labelKey: "students", value: "۵۲" },
    ],
    overview:
      "باشگاه محله‌ای با دستگاه‌های مدرن، کلاس‌های گروهی و مربیانی آماده برای ساخت عادت تمرینی پایدار.",
    pricePrefix: "از",
    price: "۳۵۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: [
      DEFAULT_SUBSCRIPTIONS[0],
      { ...DEFAULT_SUBSCRIPTIONS[1], price: 350_000, badge: undefined },
      { ...DEFAULT_SUBSCRIPTIONS[2], price: 650_000, badge: "۳۰٪" },
    ],
    amenities: DEFAULT_AMENITIES.slice(0, 3),
    sports: DEFAULT_SPORTS.slice(0, 2),
    equipment: DEFAULT_EQUIPMENT.slice(0, 4),
    coaches: DEFAULT_COACHES.slice(0, 2),
    locationCard: {
      ...DEFAULT_LOCATION,
      neighborhood: "سعادت‌آباد",
      address: "تهران، سعادت‌آباد",
    },
    branches: DEFAULT_BRANCHES.slice(0, 1),
    classes: DEFAULT_CLASSES.slice(0, 3),
    reviews: DEFAULT_REVIEWS.slice(0, 5),
    busyHours: DEFAULT_BUSY_HOURS,
    isFavorite: false,
    isSaved: false,
  },
};

function titleFromClubId(clubId: string): string {
  return clubId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createFallbackClub(clubId: string): ClubDetail {
  const title = titleFromClubId(clubId) || `Club ${clubId}`;

  return {
    id: clubId,
    title,
    location: "تهران",
    openHoursLabel: "۰۶:۰۰ – ۲۳:۰۰",
    isOpen: true,
    images: [...DEFAULT_IMAGES],
    ...clubExtras(),
    gallery: galleryFromImages([...DEFAULT_IMAGES]),
    stats: [
      { labelKey: "distance", value: "۱٫۲ کیلومتر" },
      { labelKey: "score", value: "+۵" },
      { labelKey: "students", value: "۱۲۴" },
    ],
    overview: `باشگاه ${title} را کشف کنید — تجهیزات، کلاس‌ها و مربیگری برای هر هدف تمرینی. فضای مدرن، برنامه‌های متنوع و پشتیبانی مربیان حرفه‌ای در کنار شماست تا مسیر تناسب اندام را با انگیزه ادامه دهید.`,
    pricePrefix: "از",
    price: "۷۰۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: DEFAULT_SUBSCRIPTIONS,
    amenities: DEFAULT_AMENITIES,
    sports: DEFAULT_SPORTS,
    equipment: DEFAULT_EQUIPMENT,
    coaches: DEFAULT_COACHES,
    locationCard: DEFAULT_LOCATION,
    branches: DEFAULT_BRANCHES,
    classes: DEFAULT_CLASSES,
    reviews: DEFAULT_REVIEWS,
    busyHours: DEFAULT_BUSY_HOURS,
    isFavorite: false,
    isSaved: false,
  };
}

export function getClubDetail(clubId: string): ClubDetail | undefined {
  const id = clubId.trim();
  if (!id) return undefined;
  return CLUBS[id] ?? createFallbackClub(id);
}

/** Club IDs pre-rendered for Capacitor static export (`output: "export"`). */
export function getAllClubIds(): string[] {
  return Object.keys(CLUBS);
}
