const MOCK = "/assets/images/landing/mock";

/** Local generated mock imagery (no remote Unsplash). */
export const LANDING_ASSETS = {
  hero: `${MOCK}/hero.png`,
  membership: `${MOCK}/membership.png`,
  collection: [
    {
      src: `${MOCK}/collection-1.png`,
      brand: "Gym4Me",
      title: "کلاس‌های باشگاه",
      cta: "مشاهده کلاس‌ها",
      alt: "تجهیزات تمرینی ویژه باشگاه",
    },
    {
      src: `${MOCK}/collection-2.png`,
      brand: "Gym4Me",
      title: "باشگاه نزدیک تو",
      cta: "دیدن لیست",
      alt: "تمرین فضای باز در نور طلایی",
    },
    {
      src: `${MOCK}/collection-3.png`,
      brand: "Gym4Me",
      title: "شروع مسیر",
      cta: "دانلود اپ",
      alt: "استودیو آرام برای شروع مسیر",
    },
  ],
  coaches: [
    {
      src: `${MOCK}/coach-1.png`,
      name: "آرمان کاظمی",
      role: "مربی قدرت",
      specialty: "بدنسازی و قدرت",
      alt: "مربی قدرت در سالن مدرن",
      rating: 4.9,
      ratingCount: 128,
      yearsExperience: 8,
      isCertified: true,
      isNew: false,
      headline: ["پیدا کن", "مربی", "نزدیک", "خودت"],
    },
    {
      src: `${MOCK}/coach-2.png`,
      name: "سارا نوری",
      role: "مربی عملکرد",
      specialty: "HIIT و عملکرد",
      alt: "مربی عملکرد در حال هدایت جلسه",
      rating: 4.8,
      ratingCount: 96,
      yearsExperience: 6,
      isCertified: true,
      isNew: true,
      headline: ["رزرو کن", "جلسه", "خصوصی", "الان"],
    },
    {
      src: `${MOCK}/coach-3.png`,
      name: "کیان مرادی",
      role: "مربی آمادگی",
      specialty: "آمادگی جسمانی",
      alt: "مربی آمادگی در فضای تمرین",
      rating: 4.7,
      ratingCount: 74,
      yearsExperience: 4,
      isCertified: true,
      isNew: false,
      headline: ["شروع کن", "مسیر", "تمرین", "هوشمند"],
    },
  ],
  facilities: {
    intro: `${MOCK}/facility-intro.png`,
    clay: `${MOCK}/facility-strength.png`,
    harbor: `${MOCK}/facility-cardio.png`,
  },
} as const;

export const LANDING_SPORT_THEMES = [
  {
    color: "var(--accent)",
    foregroundColor: "var(--accent-foreground)",
    actionColor: "var(--accent-foreground)",
    actionForegroundColor: "var(--accent)",
  },
  {
    color: "var(--stats-blue)",
    foregroundColor: "var(--stats-foreground)",
    actionColor: "var(--eclipse)",
    actionForegroundColor: "var(--stats-foreground)",
  },
  {
    color: "var(--stats-orange)",
    foregroundColor: "var(--stats-foreground)",
    actionColor: "var(--eclipse)",
    actionForegroundColor: "var(--stats-foreground)",
  },
  {
    color: "var(--foreground)",
    foregroundColor: "var(--background)",
    actionColor: "var(--accent)",
    actionForegroundColor: "var(--accent-foreground)",
  },
] as const;

export const LANDING_CLUBS = [
  {
    title: "پاور هاوس",
    subtitle: "تهران، سعادت‌آباد",
    image: `${MOCK}/club-1.png`,
    rating: 4.9,
    ratingCount: 214,
    price: "۲۴۰٬۰۰۰",
    features: [{ label: "پارکینگ" }, { label: "سونا" }],
  },
  {
    title: "اوربن جیم",
    subtitle: "تهران، ولیعصر",
    image: `${MOCK}/club-2.png`,
    rating: 4.7,
    ratingCount: 186,
    price: "۱۹۰٬۰۰۰",
    features: [{ label: "شبانه‌روزی" }, { label: "وای‌فای" }],
  },
  {
    title: "ماسل فکتوری",
    subtitle: "تهران، نیاوران",
    image: `${MOCK}/club-3.png`,
    rating: 4.8,
    ratingCount: 162,
    price: "۲۲۰٬۰۰۰",
    features: [{ label: "وزنه آزاد" }, { label: "دوش" }],
  },
  {
    title: "فیتنس لند",
    subtitle: "تهران، جردن",
    image: `${MOCK}/club-4.png`,
    rating: 4.8,
    ratingCount: 141,
    price: "۲۱۰٬۰۰۰",
    features: [{ label: "بانوان" }, { label: "کافه" }],
  },
  {
    title: "جیم سنترال",
    subtitle: "اصفهان، جلفا",
    image: `${MOCK}/club-5.png`,
    rating: 4.6,
    ratingCount: 98,
    price: "۱۶۵٬۰۰۰",
    features: [{ label: "کمد" }, { label: "پارکینگ" }],
  },
  {
    title: "کراس‌فیت آرنا",
    subtitle: "تهران، ونک",
    image: `${MOCK}/club-6.png`,
    rating: 4.7,
    ratingCount: 120,
    price: "۱۸۰٬۰۰۰",
    features: [{ label: "کلاس گروهی" }, { label: "دوش" }],
  },
  {
    title: "کلاب رویال",
    subtitle: "تهران، فرمانیه",
    image: `${MOCK}/club-7.png`,
    rating: 4.9,
    ratingCount: 88,
    price: "۲۹۰٬۰۰۰",
    features: [{ label: "پریمیوم" }, { label: "سونا" }],
  },
] as const;

export const LANDING_CLASSES = [
  {
    id: "hiit-morning",
    title: "HIIT صبحگاهی",
    author: "سارا نوری",
    category: "آمادگی جسمانی",
    date: "شنبه، ۲۵ خرداد",
    duration: "۴۵ دقیقه",
    backgroundImage: `${MOCK}/facility-cardio.png`,
  },
  {
    id: "strength",
    title: "قدرتی فول‌بادی",
    author: "آرمان کاظمی",
    category: "بدنسازی",
    date: "یکشنبه، ۲۶ خرداد",
    duration: "۷۰ دقیقه",
    backgroundImage: `${MOCK}/facility-strength.png`,
  },
  {
    id: "yoga",
    title: "یوگا فلو",
    author: "کیان مرادی",
    category: "یوگا",
    date: "دوشنبه، ۲۷ خرداد",
    duration: "۶۰ دقیقه",
    backgroundImage: `${MOCK}/collection-3.png`,
  },
  {
    id: "boxing",
    title: "بوکس مبتدی",
    author: "آرمان کاظمی",
    category: "رزمی",
    date: "سه‌شنبه، ۲۸ خرداد",
    duration: "۵۵ دقیقه",
    backgroundImage: `${MOCK}/collection-1.png`,
  },
] as const;

export const LANDING_MEMBERSHIPS = [
  {
    planName: "ماهانه",
    price: "۱۹۰٬۰۰۰",
    priceSuffix: "تومان / ماه",
    description: "ورود به باشگاه، رزرو کلاس و تمدید از داخل اپ.",
    badge: undefined,
    selected: false,
  },
  {
    planName: "سه‌ماهه",
    price: "۴۹۰٬۰۰۰",
    priceSuffix: "تومان",
    description: "صرفه‌جویی نسبت به ماهانه، با همان دسترسی باشگاه.",
    badge: "پیشنهاد باشگاه",
    selected: true,
  },
  {
    planName: "سالانه",
    price: "۱٬۶۸۰٬۰۰۰",
    priceSuffix: "تومان",
    description: "عضویت سال باشگاه با رزرو و یادآوری تمدید در Gym4Me.",
    badge: undefined,
    selected: false,
  },
] as const;

export const LANDING_AMENITIES = [
  { id: "parking", name: "پارکینگ", subtitle: "دسترسی آسان با خودرو" },
  { id: "shower", name: "دوش", subtitle: "پس از تمرین" },
  { id: "locker", name: "کمد", subtitle: "قفل اختصاصی" },
  { id: "sauna", name: "سونا", subtitle: "ریکاوری و ریلکس" },
  { id: "wifi", name: "وای‌فای", subtitle: "اینترنت رایگان" },
  { id: "cafe", name: "کافه", subtitle: "نوشیدنی و اسنک" },
  { id: "open24", name: "شبانه‌روزی", subtitle: "تمرین در هر ساعت" },
] as const;

export const LANDING_EQUIPMENT = [
  {
    id: "dumbbell",
    name: "دمبل",
    image: `${MOCK}/collection-1.png`,
    size: "md" as const,
  },
  {
    id: "bench",
    name: "نیمکت",
    image: `${MOCK}/facility-strength.png`,
    size: "md" as const,
  },
  {
    id: "treadmill",
    name: "تردمیل",
    image: `${MOCK}/facility-cardio.png`,
    size: "md" as const,
  },
  {
    id: "band",
    name: "کش مقاومتی",
    image: `${MOCK}/collection-2.png`,
    size: "lg" as const,
  },
  {
    id: "kettlebell",
    name: "کتل‌بل",
    image: `${MOCK}/collection-3.png`,
    size: "sm" as const,
  },
] as const;

export const LANDING_GALLERY = [
  {
    id: "g1",
    title: "سالن قدرت",
    author: "پاور هاوس",
    image: `${MOCK}/facility-strength.png`,
    viewsLabel: "۲٬۱۴۰",
  },
  {
    id: "g2",
    title: "کاردیو شب",
    author: "اوربن جیم",
    image: `${MOCK}/facility-cardio.png`,
    viewsLabel: "۱٬۸۸۰",
  },
  {
    id: "g3",
    title: "ورودی باشگاه",
    author: "فیتنس لند",
    image: `${MOCK}/facility-intro.png`,
    viewsLabel: "۹۶۰",
  },
  {
    id: "g4",
    title: "فضای گروهی",
    author: "کراس‌فیت آرنا",
    image: `${MOCK}/collection-2.png`,
    viewsLabel: "۱٬۲۴۰",
  },
] as const;

export const LANDING_ARTICLES = [
  {
    id: "warmup",
    slug: "warmup-guide",
    title: "راهنمای گرم‌کردن قبل از تمرین",
    category: "راهنما",
    coverSrc: `${MOCK}/facility-cardio.png`,
    authorName: "تیم Gym4Me",
    publishedAtLabel: "۲ روز پیش",
    readingTimeMinutes: 5,
    viewsLabel: "۱٬۲۴۰",
    likesLabel: "۸۶",
  },
  {
    id: "protein",
    slug: "protein-basics",
    title: "پروتئین کافی برای عضله‌سازی",
    category: "نکته",
    coverSrc: `${MOCK}/collection-1.png`,
    authorName: "سارا نوری",
    publishedAtLabel: "۵ روز پیش",
    readingTimeMinutes: 7,
    viewsLabel: "۲٬۱۱۰",
    likesLabel: "۱۴۲",
  },
  {
    id: "recovery",
    slug: "recovery-sleep",
    title: "خواب و ریکاوری ورزشکاران",
    category: "داستان",
    coverSrc: `${MOCK}/collection-2.png`,
    authorName: "تیم Gym4Me",
    publishedAtLabel: "۱ هفته پیش",
    readingTimeMinutes: 6,
    viewsLabel: "۹۸۰",
    likesLabel: "۷۱",
  },
  {
    id: "hiit",
    slug: "hiit-beginners",
    title: "شروع HIIT برای مبتدی‌ها",
    category: "تمرین",
    coverSrc: `${MOCK}/hero.png`,
    authorName: "آرمان کاظمی",
    publishedAtLabel: "۲ هفته پیش",
    readingTimeMinutes: 4,
    viewsLabel: "۳٬۴۵۰",
    likesLabel: "۲۰۱",
  },
] as const;

export const LANDING_REVIEWS = [
  {
    title: "رزرو کلاس بدون تماس تلفنی",
    content:
      "باشگاه نزدیک را روی نقشه پیدا کردم، کلاس HIIT را رزرو کردم و قبل از جلسه یادآوری آمد.",
    authorName: "نیلوفر احمدی",
    authorRole: "عضو اوربن جیم",
    avatarSrc: `${MOCK}/coach-2.png`,
    date: "خرداد ۱۴۰۵",
    rating: 5,
  },
  {
    title: "مربی تأییدشده، برنامه مشخص",
    content:
      "مربی قدرت را از اپ انتخاب کردم. سابقه و نظرها مشخص بود و جلسه خصوصی را همان روز بستم.",
    authorName: "سینا رضایی",
    authorRole: "ورزشکار",
    avatarSrc: `${MOCK}/coach-1.png`,
    date: "اردیبهشت ۱۴۰۵",
    rating: 4.5,
  },
  {
    title: "تمدید عضویت از داخل اپ",
    content:
      "دوره باشگاه تمام می‌شد. از صفحه باشگاه تمدید کردم و موجودی کیف‌پول بعد از پرداخت به‌روز شد.",
    authorName: "آرمین کاظمی",
    authorRole: "عضو پاور هاوس",
    avatarSrc: `${MOCK}/coach-3.png`,
    date: "فروردین ۱۴۰۵",
    rating: 5,
  },
] as const;

export const LANDING_STATS = [
  {
    title: "باشگاه",
    value: "۱۲۰",
    unit: "+",
    chart: "bar" as const,
    color: "var(--stats-orange)",
    series: [18, 24, 21, 32, 28, 36, 41],
  },
  {
    title: "رزرو",
    value: "۸٫۴",
    unit: "هزار",
    chart: "line" as const,
    color: "var(--stats-blue)",
    series: [12, 18, 16, 24, 22, 30, 34],
  },
  {
    title: "مربی",
    value: "۶۴",
    unit: "",
    chart: "bar" as const,
    color: "var(--stats-purple)",
    series: [8, 12, 10, 16, 14, 18, 22],
  },
  {
    title: "کلاس",
    value: "۲۱۰",
    unit: "",
    chart: "line" as const,
    color: "var(--accent)",
    series: [20, 28, 24, 36, 32, 40, 44],
  },
] as const;

export const LANDING_AVATAR_DOTS = [
  "var(--accent)",
  "var(--stats-yellow)",
  "var(--stats-blue)",
  "var(--background)",
] as const;
