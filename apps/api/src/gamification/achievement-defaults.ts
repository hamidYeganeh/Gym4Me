import {
  AchievementGrantMode,
  AchievementMetric,
  EntityStatus,
  GamificationSubjectType,
} from '../common/enums';

export type AchievementDefault = {
  /** Stable idempotency key (matched on seed; not stored as a DB field). */
  key: string;
  title: string;
  description?: string;
  icon: string;
  audience: GamificationSubjectType[];
  bonusPoints: number;
  grant: {
    mode: AchievementGrantMode;
    rule?: { metric: AchievementMetric; threshold: number };
  };
  status?: EntityStatus;
  order: number;
};

export const DEFAULT_ACHIEVEMENTS: AchievementDefault[] = [
  {
    key: 'first-booking',
    title: 'اولین رزرو',
    description: 'اولین رزرو موفق را کامل کنید.',
    icon: 'Ticket',
    audience: [GamificationSubjectType.ATHLETE],
    bonusPoints: 50,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.BOOKINGS_COUNT, threshold: 1 },
    },
    order: 0,
  },
  {
    key: 'booking-streak-10',
    title: 'ده رزرو',
    description: 'ده رزرو موفق ثبت کنید.',
    icon: 'Trophy1',
    audience: [GamificationSubjectType.ATHLETE],
    bonusPoints: 150,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.BOOKINGS_COUNT, threshold: 10 },
    },
    order: 1,
  },
  {
    key: 'point-collector',
    title: 'جمع‌کننده امتیاز',
    description: '۵۰۰ امتیاز مادام‌العمر کسب کنید.',
    icon: 'StarFull',
    audience: [
      GamificationSubjectType.ATHLETE,
      GamificationSubjectType.COACH,
      GamificationSubjectType.CLUB,
    ],
    bonusPoints: 0,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.LIFETIME_POINTS, threshold: 500 },
    },
    order: 2,
  },
  {
    key: 'article-reader',
    title: 'خواننده فعال',
    description: 'پنج مقاله را کامل بخوانید.',
    icon: 'Newspaper1',
    audience: [GamificationSubjectType.ATHLETE],
    bonusPoints: 40,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.ARTICLES_READ_COUNT, threshold: 5 },
    },
    order: 3,
  },
  {
    key: 'top-reviewer',
    title: 'منتقد برتر',
    description: 'سه نظر تأییدشده ثبت کنید.',
    icon: 'Medal',
    audience: [GamificationSubjectType.ATHLETE],
    bonusPoints: 80,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.REVIEWS_COUNT, threshold: 3 },
    },
    order: 4,
  },
  {
    key: 'coach-manual',
    title: 'مربی ویژه',
    description: 'نشان دستی برای مربیان برجسته.',
    icon: 'AcademicCap',
    audience: [GamificationSubjectType.COACH],
    bonusPoints: 100,
    grant: { mode: AchievementGrantMode.MANUAL },
    order: 5,
  },
  {
    key: 'club-branches',
    title: 'شبکه شعب',
    description: 'سه شعبه فعال داشته باشید.',
    icon: 'Building2',
    audience: [GamificationSubjectType.CLUB],
    bonusPoints: 200,
    grant: {
      mode: AchievementGrantMode.AUTOMATIC,
      rule: { metric: AchievementMetric.BRANCHES_COUNT, threshold: 3 },
    },
    order: 6,
  },
];
