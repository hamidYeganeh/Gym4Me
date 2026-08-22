import { PLACEHOLDER_IMAGE } from "@repo/ui/common";
import type { LocationNode, SportNode } from "@repo/api";
import type { AchievementTagColor } from "@repo/ui/cards/AchievementTag";
import type { BrowseClub } from "./clubs-browse-data";

/** Vintage city posters used for discovery location mocks. */
const CITY_IMAGE_TEHRAN = "/demo/cities/tehran.png";
const CITY_IMAGE_ISFAHAN = "/demo/cities/isfahan.png";
const CITY_IMAGE_TABRIZ = "/demo/cities/tabriz.png";

export type HomeLocationItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  subtitle?: string;
};

export type HomeSportItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string;
  iconKey?: string | null;
  parentId?: string | null;
};

export type HomeClassItem = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  category: string;
  date: string;
  duration: string;
  backgroundImage?: string;
};

/** Feature / achievement chip that deep-links into club discovery filters. */
export type HomeFeatureItem = {
  id: string;
  title: string;
  color: AchievementTagColor;
  iconKey:
    | "female"
    | "male"
    | "parking"
    | "accessible"
    | "kids"
    | "adults"
    | "premium"
    | "open24";
  href: string;
};

export type HomeAmenityItem = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  iconKey:
    | "parking"
    | "shower"
    | "locker"
    | "sauna"
    | "wifi"
    | "cafe"
    | "open24";
};

export type HomeEquipmentItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Chip width emphasis in the wrapping flex row. */
  size?: "sm" | "md" | "lg";
  href: string;
};

export type HomeGalleryItem = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  image: string;
  viewsLabel?: string;
};

export type HomeArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  coverSrc: string | null;
  authorName: string;
  authorAvatarSrc: string | null;
  publishedAtLabel: string;
  readingTimeMinutes: number;
  viewsLabel: string;
  likesLabel: string;
  tags: string[];
};

export function mapLocationToHomeItem(
  node: LocationNode,
  imageFallback = PLACEHOLDER_IMAGE,
  subtitle?: string,
): HomeLocationItem {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    image: imageFallback,
    subtitle,
  };
}

export function mapSportToHomeItem(
  node: SportNode,
  image?: string,
): HomeSportItem {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    image,
    iconKey: node.icon,
    parentId: node.parentId,
  };
}

export function galleryItemsFromClubs(clubs: BrowseClub[]): HomeGalleryItem[] {
  return clubs.slice(0, 10).map((club, index) => ({
    id: `gallery-${club.id}`,
    clubId: club.id,
    title: club.title,
    author: club.location,
    image: club.image || PLACEHOLDER_IMAGE,
    viewsLabel: `${(club.ratingCount * 12 + 40 * (index + 1)).toLocaleString("fa-IR")}`,
  }));
}

export const MOCK_PROVINCES: HomeLocationItem[] = [
  {
    id: "mock-tehran-province",
    name: "تهران",
    slug: "tehran",
    image: CITY_IMAGE_TEHRAN,
    subtitle: "استان",
  },
  {
    id: "mock-isfahan-province",
    name: "اصفهان",
    slug: "isfahan",
    image: CITY_IMAGE_ISFAHAN,
    subtitle: "استان",
  },
];

export const MOCK_CITIES: HomeLocationItem[] = [
  {
    id: "mock-tehran-city",
    name: "تهران",
    slug: "tehran-city",
    image: CITY_IMAGE_TEHRAN,
  },
  {
    id: "mock-isfahan-city",
    name: "اصفهان",
    slug: "isfahan-city",
    image: CITY_IMAGE_ISFAHAN,
  },
  {
    id: "mock-tabriz-city",
    name: "تبریز",
    slug: "tabriz-city",
    image: CITY_IMAGE_TABRIZ,
  },
  {
    id: "mock-shiraz-city",
    name: "شیراز",
    slug: "shiraz-city",
    image: PLACEHOLDER_IMAGE,
  },
];

export const MOCK_DISTRICTS: HomeLocationItem[] = [
  {
    id: "mock-vanak",
    name: "ونک",
    slug: "vanak",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-saadat",
    name: "سعادت‌آباد",
    slug: "saadat-abad",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-jordan",
    name: "جردن",
    slug: "jordan",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-narmak",
    name: "نارمک",
    slug: "narmak",
    image: PLACEHOLDER_IMAGE,
    subtitle: "تهران",
  },
  {
    id: "mock-jolfa",
    name: "جلفا",
    slug: "jolfa",
    image: PLACEHOLDER_IMAGE,
    subtitle: "اصفهان",
  },
];

/** Extra provinces for richer discovery carousels. */
export const MOCK_PROVINCES_EXTENDED: HomeLocationItem[] = [
  ...MOCK_PROVINCES,
  {
    id: "mock-fars-province",
    name: "فارس",
    slug: "fars",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
  {
    id: "mock-razavi-province",
    name: "خراسان رضوی",
    slug: "razavi-khorasan",
    image: PLACEHOLDER_IMAGE,
    subtitle: "استان",
  },
];

export const MOCK_SPORT_CATEGORIES: HomeSportItem[] = [
  {
    id: "mock-ball",
    name: "ورزش‌های توپی",
    slug: "ball-sports",
    description: null,
  },
  {
    id: "mock-fitness",
    name: "آمادگی جسمانی",
    slug: "fitness",
    description: null,
  },
  {
    id: "mock-combat",
    name: "رزمی",
    slug: "combat",
    description: null,
  },
];

export const MOCK_SPORTS: HomeSportItem[] = [
  {
    id: "mock-football",
    name: "فوتبال",
    slug: "football",
    description: "ورزش‌های توپی",
  },
  {
    id: "mock-gym",
    name: "بدنسازی",
    slug: "bodybuilding",
    description: "آمادگی جسمانی",
  },
  {
    id: "mock-yoga",
    name: "یوگا",
    slug: "yoga",
    description: "آمادگی جسمانی",
  },
  {
    id: "mock-crossfit",
    name: "کراس‌فیت",
    slug: "crossfit",
    description: "آمادگی جسمانی",
  },
  {
    id: "mock-swimming",
    name: "شنا",
    slug: "swimming",
    description: "آبی",
  },
  {
    id: "mock-boxing",
    name: "بوکس",
    slug: "boxing",
    description: "رزمی",
  },
];

export const HOME_FEATURE_ITEMS: HomeFeatureItem[] = [
  {
    id: "female_only",
    title: "بانوان",
    color: "purple",
    iconKey: "female",
    href: "/discovery/clubs?genderPolicy=female_only",
  },
  {
    id: "male_only",
    title: "آقایان",
    color: "blue",
    iconKey: "male",
    href: "/discovery/clubs?genderPolicy=male_only",
  },
  {
    id: "parking",
    title: "پارکینگ",
    color: "orange",
    iconKey: "parking",
    href: "/discovery/clubs?amenitySlug=parking",
  },
  {
    id: "accessible",
    title: "دسترسی‌پذیر",
    color: "success",
    iconKey: "accessible",
    href: "/discovery/clubs?accessibility=accessible",
  },
  {
    id: "kids",
    title: "کودکان",
    color: "yellow",
    iconKey: "kids",
    href: "/discovery/clubs?ageGroupKey=kids",
  },
  {
    id: "adults",
    title: "بزرگسالان",
    color: "accent",
    iconKey: "adults",
    href: "/discovery/clubs?ageGroupKey=adults",
  },
  {
    id: "premium",
    title: "پریمیوم",
    color: "warning",
    iconKey: "premium",
    href: "/discovery/clubs?levelKey=premium",
  },
  {
    id: "open24",
    title: "شبانه‌روزی",
    color: "red",
    iconKey: "open24",
    href: "/discovery/clubs?amenitySlug=24h",
  },
];

export const MOCK_AMENITIES: HomeAmenityItem[] = [
  {
    id: "amenity-parking",
    slug: "parking",
    name: "پارکینگ",
    subtitle: "دسترسی آسان با خودرو",
    iconKey: "parking",
  },
  {
    id: "amenity-shower",
    slug: "shower",
    name: "دوش",
    subtitle: "پس از تمرین",
    iconKey: "shower",
  },
  {
    id: "amenity-locker",
    slug: "locker",
    name: "کمد",
    subtitle: "قفل اختصاصی",
    iconKey: "locker",
  },
  {
    id: "amenity-sauna",
    slug: "sauna",
    name: "سونا",
    subtitle: "ریکاوری و ریلکس",
    iconKey: "sauna",
  },
  {
    id: "amenity-wifi",
    slug: "wifi",
    name: "وای‌فای",
    subtitle: "اینترنت رایگان",
    iconKey: "wifi",
  },
  {
    id: "amenity-cafe",
    slug: "cafe",
    name: "کافه",
    subtitle: "نوشیدنی و اسنک",
    iconKey: "cafe",
  },
  {
    id: "amenity-24h",
    slug: "24h",
    name: "شبانه‌روزی",
    subtitle: "تمرین در هر ساعت",
    iconKey: "open24",
  },
];

export const MOCK_EQUIPMENT: HomeEquipmentItem[] = [
  {
    id: "equipment-dumbbell",
    slug: "dumbbell",
    name: "دمبل",
    image: "/demo/equipment/equipment-dumbbell.png",
    size: "md",
    href: "/discovery/clubs?equipmentSlug=dumbbell",
  },
  {
    id: "equipment-bench",
    slug: "bench",
    name: "نیمکت",
    image: "/demo/equipment/equipment-bench.png",
    size: "md",
    href: "/discovery/clubs?equipmentSlug=bench",
  },
  {
    id: "equipment-treadmill",
    slug: "treadmill",
    name: "تردمیل",
    image: "/demo/equipment/equipment-treadmill.png",
    size: "md",
    href: "/discovery/clubs?equipmentSlug=treadmill",
  },
  {
    id: "equipment-resistance-band",
    slug: "resistance-band",
    name: "کش مقاومتی",
    image: "/demo/equipment/equipment-resistance-band.png",
    size: "lg",
    href: "/discovery/clubs?equipmentSlug=resistance-band",
  },
  {
    id: "equipment-kettlebell",
    slug: "kettlebell",
    name: "کتل‌بل",
    image: "/demo/equipment/equipment-kettlebell.png",
    size: "sm",
    href: "/discovery/clubs?equipmentSlug=kettlebell",
  },
];

export const MOCK_ARTICLES: HomeArticleItem[] = [
  {
    id: "mock-article-warmup",
    slug: "warmup-guide",
    title: "راهنمای گرم‌کردن قبل از تمرین",
    excerpt:
      "قبل از وزنه، بدن را با حرکت‌های پویا آماده کن تا آسیب کمتر و عملکرد بهتر باشد.",
    category: "راهنما",
    coverSrc: PLACEHOLDER_IMAGE,
    authorName: "تیم Gym4Me",
    authorAvatarSrc: null,
    publishedAtLabel: "۲ روز پیش",
    readingTimeMinutes: 5,
    viewsLabel: "۱٬۲۴۰",
    likesLabel: "۸۶",
    tags: ["گرم‌کردن", "تمرین", "راهنما"],
  },
  {
    id: "mock-article-protein",
    slug: "protein-basics",
    title: "پروتئین کافی برای عضله‌سازی",
    excerpt:
      "میزان پروتئین روزانه را با هدف و وزن خود هماهنگ کن تا ریکاوری کامل شود.",
    category: "نکته",
    coverSrc: PLACEHOLDER_IMAGE,
    authorName: "مربی سارا",
    authorAvatarSrc: null,
    publishedAtLabel: "۵ روز پیش",
    readingTimeMinutes: 7,
    viewsLabel: "۲٬۱۱۰",
    likesLabel: "۱۴۲",
    tags: ["تغذیه", "عضله", "پروتئین"],
  },
  {
    id: "mock-article-recovery",
    slug: "recovery-sleep",
    title: "خواب و ریکاوری ورزشکاران",
    excerpt:
      "خواب کافی همان تمرینی است که دیده نمی‌شود؛ بدون آن پیشرفت کند می‌شود.",
    category: "داستان",
    coverSrc: PLACEHOLDER_IMAGE,
    authorName: "تیم Gym4Me",
    authorAvatarSrc: null,
    publishedAtLabel: "۱ هفته پیش",
    readingTimeMinutes: 6,
    viewsLabel: "۹۸۰",
    likesLabel: "۷۱",
    tags: ["خواب", "ریکاوری", "سلامت"],
  },
  {
    id: "mock-article-hiit",
    slug: "hiit-beginners",
    title: "شروع HIIT برای مبتدی‌ها",
    excerpt:
      "با اینتروال‌های کوتاه شروع کن و شدت را هفته‌به‌هفته بالا ببر.",
    category: "تمرین",
    coverSrc: PLACEHOLDER_IMAGE,
    authorName: "مربی کاوه",
    authorAvatarSrc: null,
    publishedAtLabel: "۲ هفته پیش",
    readingTimeMinutes: 4,
    viewsLabel: "۳٬۴۵۰",
    likesLabel: "۲۰۱",
    tags: ["HIIT", "مبتدی", "کاردیو"],
  },
];

export const MOCK_CLASSES: HomeClassItem[] = [
  {
    id: "class-hiit-morning",
    clubId: "heavenly",
    title: "HIIT صبحگاهی",
    author: "مربی سارا",
    category: "آمادگی جسمانی",
    date: "شنبه",
    duration: "۴۵ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "class-yoga-flow",
    clubId: "zen-flow",
    title: "یوگا فلو",
    author: "مربی نازنین",
    category: "یوگا",
    date: "یکشنبه",
    duration: "۶۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "class-swim",
    clubId: "aqua-center",
    title: "شنای تکنیک",
    author: "مربی رضا",
    category: "شنا",
    date: "دوشنبه",
    duration: "۵۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "class-boxing",
    clubId: "dragon-dojo",
    title: "بوکس مبتدی",
    author: "مربی امیر",
    category: "رزمی",
    date: "سه‌شنبه",
    duration: "۵۵ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "class-spin",
    clubId: "pulse-studio",
    title: "اسپینینگ",
    author: "مربی لیلا",
    category: "کاردیو",
    date: "چهارشنبه",
    duration: "۴۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
  {
    id: "class-strength",
    clubId: "iron",
    title: "قدرتی فول‌بادی",
    author: "مربی کاوه",
    category: "بدنسازی",
    date: "پنج‌شنبه",
    duration: "۷۰ دقیقه",
    backgroundImage: PLACEHOLDER_IMAGE,
  },
];

export const DEFAULT_COACH_CITY_NAME = "تهران";
