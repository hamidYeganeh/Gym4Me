import { SportKind } from '../../common/enums';

export type SportDefaultNode = {
  kind: SportKind;
  name: string;
  slug: string;
  /** PascalCase `@repo/icons` catalog name */
  icon?: string;
  order?: number;
  children?: SportDefaultNode[];
};

/** Maps legacy lowercase seed icons → catalog names. */
export const LEGACY_SPORT_ICONS: Record<string, string> = {
  soccer: 'Soccer',
  volleyball: 'Volleyball',
  tennis: 'Tennis',
  baseball: 'Baseball',
  fitness: 'BarbellHorizontal',
  yoga: 'PersonYoga',
  rowing: 'PersonRowing',
  kickboxing: 'Boxing',
  jogging: 'PersonRunning',
  cycling: 'Bicycle',
  hiking: 'PersonHiking',
  skating: 'PersonSkating',
};

type SeedInput = [
  name: string,
  slug: string,
  icon?: string,
  branches?: SeedInput[],
];

const nodes = (kind: SportKind, items: SeedInput[]): SportDefaultNode[] =>
  items.map(([name, slug, icon, children], order) => ({
    kind,
    name,
    slug,
    ...(icon ? { icon } : {}),
    order,
    ...(children ? { children: nodes(SportKind.BRANCH, children) } : {}),
  }));

const category = (
  name: string,
  slug: string,
  order: number,
  sports: SeedInput[],
): SportDefaultNode => ({
  kind: SportKind.CATEGORY,
  name,
  slug,
  order,
  children: nodes(SportKind.SPORT, sports),
});

/**
 * Broad, consumer-friendly taxonomy for discovery and club setup.
 * A branch is only used when users commonly search/book the sub-discipline.
 */
export const DEFAULT_SPORT_TREE: SportDefaultNode[] = [
  category('ورزش‌های تیمی و توپی', 'ball-sports', 0, [
    [
      'فوتبال',
      'football',
      'Soccer',
      [
        ['فوتبال چمنی', 'association-football'],
        ['فوتسال', 'futsal'],
        ['فوتبال ساحلی', 'beach-football'],
        ['فوتبال خیابانی', 'street-football'],
      ],
    ],
    [
      'والیبال',
      'volleyball',
      'Volleyball',
      [
        ['والیبال سالنی', 'indoor-volleyball'],
        ['والیبال ساحلی', 'beach-volleyball'],
      ],
    ],
    [
      'بسکتبال',
      'basketball',
      'Basketball',
      [
        ['بسکتبال پنج‌نفره', 'five-on-five-basketball'],
        ['بسکتبال سه‌نفره', 'three-on-three-basketball'],
        ['بسکتبال با ویلچر', 'wheelchair-basketball'],
      ],
    ],
    ['هندبال', 'handball', 'PersonDodgeball'],
    [
      'راگبی',
      'rugby',
      'Rugby',
      [
        ['راگبی پانزده‌نفره', 'rugby-union'],
        ['راگبی هفت‌نفره', 'rugby-sevens'],
      ],
    ],
    ['بیسبال', 'baseball', 'Baseball'],
    ['سافت‌بال', 'softball', 'Baseball'],
    [
      'هاکی',
      'hockey',
      'Hockey',
      [
        ['هاکی روی چمن', 'field-hockey'],
        ['هاکی سالنی', 'indoor-hockey'],
        ['هاکی روی یخ', 'ice-hockey'],
      ],
    ],
  ]),
  category('بدنسازی و آمادگی جسمانی', 'fitness', 1, [
    [
      'بدنسازی',
      'bodybuilding',
      'BarbellHorizontal',
      [
        ['پرورش اندام', 'bodybuilding-physique'],
        ['فیزیک', 'mens-physique'],
        ['بادی کلاسیک', 'classic-physique'],
      ],
    ],
    ['فیتنس', 'general-fitness', 'Bicep'],
    [
      'تمرین قدرتی',
      'strength-training',
      'Weight',
      [
        ['پاورلیفتینگ', 'powerlifting'],
        ['وزنه‌برداری', 'olympic-weightlifting'],
        ['مردان آهنین', 'strongman'],
      ],
    ],
    ['کراس‌فیت', 'crossfit', 'Weight'],
    ['تمرین عملکردی', 'functional-training', 'PersonArmsSpread'],
    ['کالستنیکس', 'calisthenics', 'PersonArmsSpread'],
    ['تی‌آر‌ایکس', 'trx', 'PersonArmsSpread'],
    ['ایروبیک', 'aerobics', 'PersonRunning'],
    ['اسپینینگ', 'spinning', 'PersonBiking'],
    [
      'ژیمناستیک',
      'gymnastics',
      'PersonAcrobatics',
      [
        ['ژیمناستیک هنری', 'artistic-gymnastics'],
        ['ژیمناستیک ریتمیک', 'rhythmic-gymnastics'],
        ['ترامپولین', 'trampoline'],
      ],
    ],
  ]),
  category('ذهن و بدن', 'mind-body', 2, [
    [
      'یوگا',
      'yoga',
      'PersonYoga',
      [
        ['هاتا یوگا', 'hatha-yoga'],
        ['وینیاسا یوگا', 'vinyasa-yoga'],
        ['آشتانگا یوگا', 'ashtanga-yoga'],
        ['یین یوگا', 'yin-yoga'],
        ['یوگای بارداری', 'prenatal-yoga'],
      ],
    ],
    [
      'پیلاتس',
      'pilates',
      'PersonYoga',
      [
        ['پیلاتس مت', 'mat-pilates'],
        ['پیلاتس ریفورمر', 'reformer-pilates'],
      ],
    ],
    ['مدیتیشن', 'meditation', 'PersonMeditation'],
    ['تای‌چی', 'tai-chi', 'PersonKarate'],
    ['چی‌کونگ', 'qigong', 'PersonMeditation'],
    ['حرکات اصلاحی', 'corrective-exercise', 'PersonArmsSpread'],
  ]),
  category('ورزش‌های رزمی', 'combat', 3, [
    ['بوکس', 'boxing', 'Boxing'],
    ['کیک‌بوکسینگ', 'kickboxing', 'Boxing'],
    ['موی‌تای', 'muay-thai', 'Boxing'],
    [
      'کاراته',
      'karate',
      'PersonKarate',
      [
        ['کاتا', 'karate-kata'],
        ['کومیته', 'karate-kumite'],
      ],
    ],
    ['تکواندو', 'taekwondo', 'PersonKarate'],
    ['جودو', 'judo', 'PersonKarate'],
    [
      'جوجیتسو',
      'jiu-jitsu',
      'PersonKarate',
      [
        ['جوجیتسو برزیلی', 'brazilian-jiu-jitsu'],
        ['جوجیتسو ژاپنی', 'japanese-jiu-jitsu'],
      ],
    ],
    [
      'کشتی',
      'wrestling',
      'PersonKarate',
      [
        ['کشتی آزاد', 'freestyle-wrestling'],
        ['کشتی فرنگی', 'greco-roman-wrestling'],
        ['کشتی پهلوانی', 'pahlavani-wrestling'],
      ],
    ],
    ['هنرهای رزمی ترکیبی', 'mma', 'Boxing'],
    [
      'ووشو',
      'wushu',
      'PersonKarate',
      [
        ['ساندا', 'sanda'],
        ['تالو', 'taolu'],
      ],
    ],
    ['دفاع شخصی', 'self-defense', 'ShieldCheck'],
    ['شمشیربازی', 'fencing'],
  ]),
  category('ورزش‌های راکتی', 'racket-sports', 4, [
    [
      'تنیس',
      'tennis',
      'Tennis',
      [
        ['تنیس انفرادی', 'singles-tennis'],
        ['تنیس دونفره', 'doubles-tennis'],
      ],
    ],
    ['پینگ‌پنگ', 'table-tennis', 'Tennis1'],
    ['بدمینتون', 'badminton', 'Tennis1'],
    ['اسکواش', 'squash', 'Tennis1'],
    ['پدل', 'padel', 'Tennis'],
    ['پیکل‌بال', 'pickleball', 'Tennis1'],
  ]),
  category('ورزش‌های آبی', 'aquatics', 5, [
    [
      'شنا',
      'swimming',
      'PersonSwimming',
      [
        ['شنای آزاد', 'freestyle-swimming'],
        ['شنای قورباغه', 'breaststroke'],
        ['شنای پروانه', 'butterfly-swimming'],
        ['شنای کرال پشت', 'backstroke'],
        ['آب‌های آزاد', 'open-water-swimming'],
      ],
    ],
    ['واترپلو', 'water-polo', 'PersonSwimming'],
    ['شیرجه', 'diving', 'PersonSwimming'],
    ['شنای موزون', 'artistic-swimming', 'PersonSwimming'],
    ['ایروبیک در آب', 'aqua-fitness', 'PersonSwimming'],
    [
      'قایقرانی',
      'boating',
      'Boat',
      [
        ['کایاک', 'kayaking'],
        ['کانو', 'canoeing'],
      ],
    ],
    ['پاروزنی', 'rowing', 'PersonRowing'],
    ['موج‌سواری', 'surfing', 'PersonSwimming'],
    ['غواصی', 'scuba-diving', 'PersonSwimming'],
  ]),
  category('دو، دوچرخه و استقامت', 'endurance', 6, [
    [
      'دویدن',
      'jogging',
      'PersonRunning',
      [
        ['دو سرعت', 'sprinting'],
        ['دو استقامت', 'distance-running'],
        ['ماراتن', 'marathon'],
        ['تریل رانینگ', 'trail-running'],
      ],
    ],
    ['پیاده‌روی', 'walking', 'PersonWalking'],
    [
      'دوچرخه‌سواری',
      'cycling',
      'Bicycle',
      [
        ['دوچرخه جاده', 'road-cycling'],
        ['دوچرخه کوهستان', 'mountain-biking'],
        ['بی‌ام‌ایکس', 'bmx'],
        ['دوچرخه پیست', 'track-cycling'],
      ],
    ],
    ['سه‌گانه', 'triathlon', 'Trophy1'],
  ]),
  category('فضای باز و ماجراجویی', 'outdoor', 7, [
    [
      'کوهنوردی',
      'hiking',
      'PersonHiking',
      [
        ['کوه‌پیمایی', 'trekking'],
        ['آلپینیسم', 'mountaineering'],
      ],
    ],
    [
      'سنگ‌نوردی',
      'climbing',
      'PersonHiking',
      [
        ['سنگ‌نوردی سالن', 'indoor-climbing'],
        ['بولدرینگ', 'bouldering'],
        ['سنگ‌نوردی طبیعت', 'outdoor-climbing'],
      ],
    ],
    ['دره‌نوردی', 'canyoning', 'PersonHiking'],
    ['پارکور', 'parkour', 'PersonRunning'],
    [
      'اسکیت',
      'skating',
      'PersonSkating',
      [
        ['اسکیت سرعت', 'speed-skating'],
        ['اسکیت نمایشی', 'artistic-skating'],
        ['اسکیت‌برد', 'skateboarding'],
      ],
    ],
    ['جهت‌یابی ورزشی', 'orienteering', 'MapPin2'],
  ]),
  category('ورزش‌های دقتی و مهارتی', 'precision-sports', 8, [
    ['تیراندازی با کمان', 'archery', 'Archery'],
    [
      'تیراندازی',
      'shooting',
      'Target1',
      [
        ['تفنگ بادی', 'air-rifle'],
        ['تپانچه بادی', 'air-pistol'],
      ],
    ],
    ['بولینگ', 'bowling'],
    [
      'بیلیارد',
      'billiards',
      undefined,
      [
        ['اسنوکر', 'snooker'],
        ['پول', 'pool-billiards'],
      ],
    ],
    ['دارت', 'darts', 'Target1'],
    ['گلف', 'golf', 'Golf'],
  ]),
  category('ورزش‌های زمستانی', 'winter-sports', 9, [
    [
      'اسکی',
      'skiing',
      undefined,
      [
        ['اسکی آلپاین', 'alpine-skiing'],
        ['اسکی صحرانوردی', 'cross-country-skiing'],
      ],
    ],
    ['اسنوبرد', 'snowboarding'],
    ['اسکیت روی یخ', 'ice-skating', 'PersonSkating'],
  ]),
  category('رقص و ورزش‌های نمایشی', 'dance-performance', 10, [
    [
      'رقص ورزشی',
      'dance-fitness',
      'PersonAcrobatics',
      [
        ['زومبا', 'zumba'],
        ['رقص هوازی', 'aerobic-dance'],
      ],
    ],
    ['باله', 'ballet', 'PersonAcrobatics'],
    ['ایروبیک ژیمناستیک', 'aerobic-gymnastics', 'PersonAcrobatics'],
  ]),
  category('ورزش‌های ایرانی و سنتی', 'iranian-traditional', 11, [
    ['ورزش زورخانه‌ای', 'zurkhaneh', 'Bicep'],
    ['کشتی پهلوانی', 'pahlavani', 'PersonKarate'],
    ['چوگان', 'polo'],
  ]),
  category('ورزش‌های توان‌یابان', 'adaptive-sports', 12, [
    ['ورزش با ویلچر', 'wheelchair-sports', 'PersonWheelchair'],
    ['گلبال', 'goalball', 'Soccer'],
    ['بوچیا', 'boccia', 'Target1'],
    ['پارا شنا', 'para-swimming', 'PersonSwimming'],
    ['پارا دوومیدانی', 'para-athletics', 'PersonWheelchair'],
  ]),
  category('سایر رشته‌ها', 'other-sports', 13, [
    ['سوارکاری', 'equestrian'],
    [
      'دوومیدانی',
      'athletics',
      'PersonRunning',
      [
        ['پرش‌ها', 'athletics-jumps'],
        ['پرتاب‌ها', 'athletics-throws'],
        ['مسابقات ترکیبی', 'combined-events'],
      ],
    ],
    ['کبدی', 'kabaddi', 'PersonDodgeball'],
    ['شطرنج', 'chess'],
    ['ورزش الکترونیک', 'esports'],
  ]),
];
