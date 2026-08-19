export type ChoiceSeedOption = {
  value: string;
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
};

export type ChoiceSeed = {
  key: string;
  name: string;
  description?: string;
  isSystem: boolean;
  options: ChoiceSeedOption[];
};

/** Platform choice groups used by onboarding, units, clubs and nutrition. */
export const DEFAULT_CHOICE_GROUPS: ChoiceSeed[] = [
  {
    key: 'gender',
    name: 'جنسیت',
    isSystem: true,
    options: [
      { value: 'male', name: 'مرد', order: 0 },
      { value: 'female', name: 'زن', order: 1 },
    ],
  },
  {
    key: 'athlete_goal',
    name: 'هدف از اپ',
    description: 'هدف کاربر از استفاده از اپلیکیشن را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'overallHealth', name: 'بهبود سلامت کلی', order: 0 },
      { value: 'trackMetrics', name: 'پیگیری شاخص‌های سلامتی', order: 1 },
      {
        value: 'aiAssistant',
        name: 'می‌خواهم دستیار هوش مصنوعی را امتحان کنم',
        order: 2,
      },
      { value: 'sportsActivity', name: 'تحلیل فعالیت ورزشی', order: 3 },
      {
        value: 'justTrying',
        name: 'فقط می‌خواهم اپ را امتحان کنم',
        order: 4,
      },
    ],
  },
  {
    key: 'body_type',
    name: 'تیپ بدنی',
    description: 'تیپ بدنی فعلی ورزشکار را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'endomorph', name: 'اندومورف', order: 0 },
      { value: 'ectomorph', name: 'اکتومورف', order: 1 },
      { value: 'mesomorph', name: 'مزومورف', order: 2 },
    ],
  },
  {
    key: 'weight_unit',
    name: 'واحد وزن',
    description: 'واحد نمایش وزن را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'kg', name: 'کیلوگرم', order: 0 },
      { value: 'lb', name: 'پوند', order: 1 },
    ],
  },
  {
    key: 'height_unit',
    name: 'واحد قد',
    description: 'واحد نمایش قد را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'cm', name: 'سانتی‌متر', order: 0 },
      { value: 'ft_in', name: 'فوت/اینچ', order: 1 },
    ],
  },
  {
    key: 'distance_unit',
    name: 'واحد مسافت',
    description: 'واحد نمایش مسافت را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'km', name: 'کیلومتر', order: 0 },
      { value: 'mi', name: 'مایل', order: 1 },
    ],
  },
  {
    key: 'speed_unit',
    name: 'واحد سرعت',
    description: 'واحد نمایش سرعت را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'km_h', name: 'کیلومتر بر ساعت', order: 0 },
      { value: 'mph', name: 'مایل بر ساعت', order: 1 },
    ],
  },
  {
    key: 'blood_pressure_unit',
    name: 'واحد فشار خون',
    description: 'واحد نمایش فشار خون را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'mmhg', name: 'میلی‌متر جیوه', order: 0 },
      { value: 'kpa', name: 'کیلوپاسکال', order: 1 },
    ],
  },
  {
    key: 'nutrition_unit',
    name: 'واحد تغذیه',
    description: 'واحد نمایش انرژی تغذیه را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'kcal', name: 'کیلوکالری', order: 0 },
      { value: 'kj', name: 'کیلوژول', order: 1, isActive: false },
    ],
  },
  {
    key: 'calorie_unit',
    name: 'واحد کالری',
    description: 'واحد نمایش کالری را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'kcal', name: 'کیلوکالری', order: 0, isActive: false },
      { value: 'kj', name: 'کیلوژول', order: 1, isActive: false },
    ],
  },
  {
    key: 'glucose_unit',
    name: 'واحد قند خون',
    description: 'واحد نمایش قند خون را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'mg_dl', name: 'میلی‌گرم بر دسی‌لیتر', order: 0 },
      { value: 'mmol_l', name: 'میلی‌مول بر لیتر', order: 1 },
    ],
  },
  {
    key: 'athlete_level',
    name: 'سطح ورزشکار',
    isSystem: true,
    options: [
      {
        value: 'beginner',
        name: 'مبتدی',
        description: 'تقریباً ورزش نمی‌کنم یا تازه شروع کرده‌ام.',
        order: 0,
      },
      {
        value: 'novice',
        name: 'تازه‌کار',
        description: 'هفته‌ای ۱ تا ۲ جلسه ورزش سبک دارم.',
        order: 1,
      },
      {
        value: 'intermediate',
        name: 'متوسط',
        description: 'هفته‌ای ۲ تا ۳ جلسه تمرین منظم دارم.',
        order: 2,
      },
      {
        value: 'athletic',
        name: 'ورزشکار',
        description: 'هفته‌ای ۳ تا ۴ جلسه تمرین می‌کنم.',
        order: 3,
      },
      {
        value: 'pro',
        name: 'حرفه‌ای',
        description: 'بیش از ۴ جلسه در هفته تمرین جدی دارم.',
        order: 4,
      },
    ],
  },
  {
    key: 'athlete_diet',
    name: 'رژیم غذایی',
    description: 'عادت غذایی ورزشکار را انتخاب کنید.',
    isSystem: true,
    options: [
      {
        value: 'balanced',
        name: 'رژیم متعادل',
        description: 'رژیم غذایی متعادلی دارم.',
        order: 0,
      },
      {
        value: 'vegetarian',
        name: 'گیاه‌خواری',
        description: 'ترجیح می‌دهم گیاهی غذا بخورم.',
        order: 1,
      },
      {
        value: 'protein',
        name: 'پروتئین‌محور',
        description: 'روی پروتئین تمرکز دارم.',
        order: 2,
      },
      {
        value: 'gluten_free',
        name: 'بدون گلوتن',
        description: 'از غذاهای بدون گلوتن استفاده می‌کنم.',
        order: 3,
      },
    ],
  },
  {
    key: 'nutrition_category',
    name: 'دسته غذایی',
    description: 'دسته‌بندی اقلام بانک تغذیه را انتخاب کنید.',
    isSystem: true,
    options: [
      { value: 'dairy', name: 'لبنیات', order: 0 },
      { value: 'meat', name: 'گوشت و تخم‌مرغ', order: 1 },
      { value: 'seafood', name: 'غذای دریایی', order: 2 },
      { value: 'grains', name: 'غلات و نان', order: 3 },
      { value: 'fruit', name: 'میوه', order: 4 },
      { value: 'vegetables', name: 'سبزیجات', order: 5 },
      { value: 'legumes', name: 'حبوبات', order: 6 },
      { value: 'beverages', name: 'نوشیدنی', order: 7 },
      { value: 'snacks', name: 'میان‌وعده', order: 8 },
      { value: 'fats', name: 'روغن و مغزها', order: 9 },
      { value: 'supplements', name: 'مکمل', order: 10 },
      { value: 'other', name: 'سایر', order: 11 },
    ],
  },
  {
    key: 'coach_level',
    name: 'سطح مربی',
    isSystem: false,
    options: [
      { value: 'junior', name: 'جونیور', order: 0 },
      { value: 'mid', name: 'متوسط', order: 1 },
      { value: 'senior', name: 'ارشد', order: 2 },
      { value: 'master', name: 'مستر', order: 3 },
    ],
  },
  {
    key: 'club_level',
    name: 'سطح باشگاه',
    isSystem: false,
    options: [
      { value: 'local', name: 'محلی', order: 0 },
      { value: 'standard', name: 'استاندارد', order: 1 },
      { value: 'premium', name: 'پریمیوم', order: 2 },
      { value: 'elite', name: 'نخبگان', order: 3 },
    ],
  },
  {
    key: 'gender_policy',
    name: 'پذیرش جنسیتی',
    isSystem: true,
    options: [
      { value: 'mixed', name: 'مختلط', order: 0 },
      { value: 'male_only', name: 'فقط آقایان', order: 1 },
      { value: 'female_only', name: 'فقط بانوان', order: 2 },
    ],
  },
  {
    key: 'age_group',
    name: 'گروه سنی',
    isSystem: true,
    options: [
      { value: 'kids', name: 'کودکان', order: 0 },
      { value: 'teens', name: 'نوجوانان', order: 1 },
      { value: 'adults', name: 'بزرگسالان', order: 2 },
      { value: 'seniors', name: 'سالمندان', order: 3 },
    ],
  },
  {
    key: 'social_platform',
    name: 'شبکه‌های اجتماعی',
    isSystem: false,
    options: [
      { value: 'instagram', name: 'اینستاگرام', order: 0 },
      { value: 'telegram', name: 'تلگرام', order: 1 },
      { value: 'whatsapp', name: 'واتساپ', order: 2 },
      { value: 'website', name: 'وب‌سایت', order: 3 },
      { value: 'x', name: 'ایکس', order: 4 },
    ],
  },
];
