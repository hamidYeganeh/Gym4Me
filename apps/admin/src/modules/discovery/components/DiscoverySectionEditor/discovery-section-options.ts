import {
  DISCOVERY_ACTION_BUTTON_VARIANTS,
  type DiscoveryActionButtonVariant,
  type DiscoverySectionKind,
  type DiscoverySourceStrategy,
} from "@repo/api/discovery";

export const DISCOVERY_ACTION_VARIANT_OPTIONS: Array<{
  value: DiscoveryActionButtonVariant;
  label: string;
}> = [
  { value: "primary", label: "اصلی (Primary)" },
  { value: "secondary", label: "ثانویه (Secondary)" },
  { value: "tertiary", label: "سوم (Tertiary)" },
  { value: "outline", label: "خطی (Outline)" },
  { value: "ghost", label: "شبح (Ghost)" },
  { value: "danger", label: "خطر (Danger)" },
];

export { DISCOVERY_ACTION_BUTTON_VARIANTS };

export const DISCOVERY_KIND_META: Record<
  DiscoverySectionKind,
  { label: string; description: string; icon: string }
> = {
  banners: {
    label: "بنرهای تبلیغاتی",
    description: "کمپین‌ها و پیشنهادهای تصویری فعال",
    icon: "▣",
  },
  club_categories: {
    label: "نوع باشگاه",
    description: "دسته‌بندی باشگاه‌ها به شکل شبکه‌ای",
    icon: "⊞",
  },
  sport_categories: {
    label: "دسته‌بندی ورزش‌ها",
    description: "گروه‌های اصلی رشته‌های ورزشی",
    icon: "◫",
  },
  sports: {
    label: "رشته‌های ورزشی",
    description: "لیستی از ورزش‌های قابل انتخاب",
    icon: "●",
  },
  clubs: {
    label: "باشگاه‌ها",
    description: "باشگاه‌های برتر، نزدیک یا پیشنهادی",
    icon: "⌂",
  },
  coaches: {
    label: "مربی‌ها",
    description: "مربی‌های برتر، مرتبط، دارای وقت آزاد یا تأییدشده",
    icon: "◉",
  },
  classes: {
    label: "کلاس‌ها",
    description: "کلاس‌های امروز، نزدیک به شروع یا دارای ظرفیت",
    icon: "◷",
  },
  spaces: {
    label: "فضاها و زمین‌ها",
    description: "استخر، زمین، سالن و سایر فضاهای قابل رزرو",
    icon: "▦",
  },
  slots: {
    label: "سانس‌ها",
    description: "سانس‌های امروز، فردا یا دارای ظرفیت بیشتر",
    icon: "◴",
  },
  equipment: {
    label: "تجهیزات ورزشی",
    description: "تجهیزات عمومی و تخصصی موجود در باشگاه‌ها",
    icon: "◆",
  },
  membership_plans: {
    label: "عضویت‌ها و پلن‌ها",
    description: "پلن‌های اقتصادی، جلسه‌ای، مدتی یا بدون محدودیت",
    icon: "▤",
  },
  bookable_offers: {
    label: "پیشنهادهای قابل رزرو",
    description: "گزینه‌های واقعی با occurrence فعال و ظرفیت باقی‌مانده",
    icon: "✓",
  },
  amenities: {
    label: "امکانات رفاهی",
    description: "دوش، رختکن، پارکینگ، کمد، سونا و دسترسی‌پذیری",
    icon: "✦",
  },
  locations: {
    label: "مقاصد پرطرفدار",
    description: "استان، شهر و محله‌های پرطرفدار برای کشف باشگاه یا مربی",
    icon: "⌖",
  },
  articles: {
    label: "مقالات",
    description: "آخرین محتوای آموزشی و مجله",
    icon: "≡",
  },
};

export const DISCOVERY_STRATEGIES: Record<
  DiscoverySectionKind,
  Array<{ value: DiscoverySourceStrategy; label: string; hint: string }>
> = {
  banners: [
    { value: "active", label: "بنرهای فعال", hint: "بر اساس بازه انتشار" },
  ],
  club_categories: [
    { value: "featured", label: "دسته‌های منتخب", hint: "ترتیب مدیریت‌شده" },
  ],
  sport_categories: [
    { value: "featured", label: "دسته‌های منتخب", hint: "ترتیب مدیریت‌شده" },
  ],
  sports: [
    { value: "featured", label: "ورزش‌های منتخب", hint: "ترتیب مدیریت‌شده" },
  ],
  clubs: [
    {
      value: "top_rated",
      label: "بالاترین امتیاز",
      hint: "محبوب‌ترین باشگاه‌ها",
    },
    {
      value: "nearby",
      label: "نزدیک کاربر",
      hint: "بر اساس موقعیت فعال کاربر",
    },
    {
      value: "recommended_for_user",
      label: "پیشنهاد شخصی",
      hint: "بر اساس علایق ورزشی کاربر",
    },
    { value: "featured", label: "باشگاه‌های منتخب", hint: "ترتیب مدیریت‌شده" },
  ],
  coaches: [
    {
      value: "top_rated",
      label: "مربی‌های برتر",
      hint: "بر اساس سابقه و کیفیت پروفایل",
    },
    { value: "nearby", label: "نزدیک کاربر", hint: "بر اساس شهر فعال کاربر" },
    {
      value: "recommended_for_user",
      label: "مناسب رشته کاربر",
      hint: "بر اساس علایق ورزشی",
    },
    {
      value: "available",
      label: "دارای وقت آزاد",
      hint: "دارای زمان آزاد قابل رزرو",
    },
    {
      value: "verified",
      label: "مربی‌های تأییدشده",
      hint: "فقط پروفایل‌های تأییدشده",
    },
  ],
  classes: [
    {
      value: "today",
      label: "کلاس‌های امروز",
      hint: "کلاس‌هایی با سانس امروز",
    },
    {
      value: "starting_soon",
      label: "شروع نزدیک",
      hint: "نزدیک‌ترین کلاس‌های آینده",
    },
    {
      value: "capacity_available",
      label: "ظرفیت باقی‌مانده",
      hint: "فقط کلاس‌های قابل رزرو",
    },
    {
      value: "beginner_friendly",
      label: "مناسب مبتدی‌ها",
      hint: "کلاس‌های علامت‌گذاری‌شده برای مبتدی",
    },
    { value: "latest", label: "تازه‌ترین کلاس‌ها", hint: "بر اساس زمان ایجاد" },
  ],
  spaces: [
    {
      value: "featured",
      label: "فضاهای منتخب",
      hint: "فضاهای فعال باشگاه‌های تأییدشده",
    },
    {
      value: "recommended_for_user",
      label: "مناسب رشته کاربر",
      hint: "بر اساس علایق ورزشی",
    },
    {
      value: "latest",
      label: "تازه‌اضافه‌شده",
      hint: "جدیدترین فضاها و زمین‌ها",
    },
  ],
  slots: [
    {
      value: "today",
      label: "سانس‌های امروز",
      hint: "سانس‌های باقی‌مانده امروز",
    },
    { value: "tomorrow", label: "سانس‌های فردا", hint: "سانس‌های فعال فردا" },
    {
      value: "least_crowded",
      label: "خلوت‌ترین سانس‌ها",
      hint: "بیشترین ظرفیت باقی‌مانده",
    },
    {
      value: "capacity_available",
      label: "دارای ظرفیت",
      hint: "سانس‌های آینده با جای خالی",
    },
  ],
  equipment: [
    {
      value: "featured",
      label: "تجهیزات پرکاربرد",
      hint: "بر اساس تعداد باشگاه‌های ارائه‌دهنده",
    },
  ],
  membership_plans: [
    { value: "economical", label: "اقتصادی", hint: "کمترین قیمت منتشرشده" },
    {
      value: "featured",
      label: "پلن‌های منتخب",
      hint: "پلن‌های فعال و منتشرشده",
    },
    {
      value: "duration",
      label: "مدتی و ماهانه",
      hint: "پلن‌های مبتنی بر مدت اعتبار",
    },
    {
      value: "sessions",
      label: "جلسه‌ای",
      hint: "پلن‌های دارای تعداد جلسه مشخص",
    },
    {
      value: "entries",
      label: "تعداد ورود",
      hint: "پلن‌های دارای اعتبار ورود",
    },
    {
      value: "unlimited",
      label: "بدون محدودیت",
      hint: "پلن‌های مدتی بدون سقف جلسه یا ورود",
    },
    { value: "latest", label: "تازه‌اضافه‌شده", hint: "جدیدترین پلن‌ها" },
  ],
  bookable_offers: [
    {
      value: "available",
      label: "قابل رزرو همین حالا",
      hint: "آینده نزدیک با ظرفیت واقعی بیشتر از صفر",
    },
    {
      value: "starting_soon",
      label: "شروع نزدیک",
      hint: "نزدیک‌ترین occurrenceهای قابل رزرو",
    },
    { value: "least_crowded", label: "ظرفیت بیشتر", hint: "بیشترین جای خالی" },
  ],
  amenities: [
    {
      value: "featured",
      label: "امکانات پرطرفدار",
      hint: "بر اساس تعداد باشگاه‌های ارائه‌دهنده",
    },
  ],
  locations: [
    {
      value: "featured",
      label: "مقاصد منتخب",
      hint: "بر اساس اسلاگ‌های تعریف‌شده یا محبوبیت باشگاه‌ها",
    },
  ],
  articles: [
    { value: "latest", label: "جدیدترین مقالات", hint: "بر اساس زمان انتشار" },
  ],
};

export const DISCOVERY_SECTION_KINDS = Object.keys(
  DISCOVERY_KIND_META,
) as DiscoverySectionKind[];
