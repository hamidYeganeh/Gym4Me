import { statsColors } from "@repo/theme";
import type { ClubLocationLatLng } from "@repo/ui/cards/ClubLocationCard";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type ClubDetailStatKey = "minutes" | "score" | "tasks";

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
  duration: string;
  calories: string;
  distanceLabel: string;
  startLabel: string;
  endLabel: string;
  route: readonly ClubLocationLatLng[];
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
  images: string[];
  stats: ClubDetailStat[];
  overview: string;
  pricePrefix: string;
  price: string;
  priceSuffix: string;
  subscriptions: ClubDetailSubscription[];
  sports: ClubDetailSport[];
  equipment: ClubDetailEquipment[];
  locationCard: ClubDetailLocation;
  branches: ClubDetailBranch[];
  classes: ClubDetailClassPreview[];
  reviews: ClubDetailReview[];
  /** Typical crowd level across the day (hour labels). */
  busyHours: ClubDetailBusyHour[];
  isFavorite?: boolean;
  isSaved?: boolean;
};

const DEFAULT_IMAGES = [
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_IMAGE,
] as const;

const TEHRAN_ROUTE: ClubLocationLatLng[] = [
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
  duration: "۴۰ دقیقه",
  calories: "۱۵۰ کالری",
  distanceLabel: "۷٫۲ کیلومتر",
  startLabel: "شروع",
  endLabel: "پایان",
  route: TEHRAN_ROUTE,
};

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

/** Mock peak-hours curve — morning rush, midday lull, evening peak. */
const DEFAULT_BUSY_HOURS: ClubDetailBusyHour[] = [
  { label: "۶", value: 82 },
  { label: "۹", value: 55 },
  { label: "۱۲", value: 68 },
  { label: "۱۵", value: 32 },
  { label: "۱۸", value: 58 },
  { label: "۲۱", value: 92 },
  { label: "۲۳", value: 74 },
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
    title: "Heavenly Fitness",
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "minutes", value: "10-20" },
      { labelKey: "score", value: "+5" },
      { labelKey: "tasks", value: "3" },
    ],
    overview: LONG_OVERVIEW,
    pricePrefix: "از",
    price: "۷۰۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: DEFAULT_SUBSCRIPTIONS,
    sports: DEFAULT_SPORTS,
    equipment: DEFAULT_EQUIPMENT,
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
    title: "Iron Paradise",
    location: "Isfahan, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "minutes", value: "15-30" },
      { labelKey: "score", value: "+4" },
      { labelKey: "tasks", value: "5" },
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
    sports: DEFAULT_SPORTS.slice(0, 3),
    equipment: DEFAULT_EQUIPMENT.slice(0, 5),
    locationCard: {
      ...DEFAULT_LOCATION,
      title: "مسیر آیرون پارادایس",
    },
    branches: DEFAULT_BRANCHES.slice(0, 2),
    classes: DEFAULT_CLASSES.slice(0, 4),
    reviews: DEFAULT_REVIEWS.slice(0, 6),
    busyHours: [
      { label: "۶", value: 70 },
      { label: "۹", value: 88 },
      { label: "۱۲", value: 45 },
      { label: "۱۵", value: 28 },
      { label: "۱۸", value: 62 },
      { label: "۲۱", value: 95 },
      { label: "۲۳", value: 60 },
    ],
    isFavorite: true,
    isSaved: true,
  },
  "123": {
    id: "123",
    title: "Club 123",
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "minutes", value: "20-40" },
      { labelKey: "score", value: "+3" },
      { labelKey: "tasks", value: "2" },
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
    sports: DEFAULT_SPORTS.slice(0, 2),
    equipment: DEFAULT_EQUIPMENT.slice(0, 4),
    locationCard: DEFAULT_LOCATION,
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
    location: "Tehran, Iran",
    images: [...DEFAULT_IMAGES],
    stats: [
      { labelKey: "minutes", value: "10-20" },
      { labelKey: "score", value: "+5" },
      { labelKey: "tasks", value: "3" },
    ],
    overview: `باشگاه ${title} را کشف کنید — تجهیزات، کلاس‌ها و مربیگری برای هر هدف تمرینی. فضای مدرن، برنامه‌های متنوع و پشتیبانی مربیان حرفه‌ای در کنار شماست تا مسیر تناسب اندام را با انگیزه ادامه دهید.`,
    pricePrefix: "از",
    price: "۷۰۰٬۰۰۰",
    priceSuffix: "تومان",
    subscriptions: DEFAULT_SUBSCRIPTIONS,
    sports: DEFAULT_SPORTS,
    equipment: DEFAULT_EQUIPMENT,
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
