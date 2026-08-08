import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type CoachClientEngagement = "active" | "at-risk" | "paused";

export type CoachClient = {
  id: string;
  name: string;
  avatar: string;
  goalLabel: string;
  levelLabel: string;
  lastSessionLabel: string;
  progressPercent: number;
  engagement: CoachClientEngagement;
  nextSessionLabel?: string;
};

export type CoachClientSession = {
  id: string;
  dateLabel: string;
  typeLabel: string;
  status: "COMPLETED" | "CONFIRMED" | "CANCELLED" | "NO_SHOW";
};

export type CoachClientDetail = CoachClient & {
  trendPoints: { label: string; value: number }[];
  monthlySessionsSeries: number[];
  adherenceSeries: number[];
  monthlySessionsValue: string;
  adherenceValue: string;
  upcomingSessions: CoachClientSession[];
  sessionHistory: CoachClientSession[];
  note: string;
};

export const COACH_CLIENTS: CoachClient[] = [
  {
    id: "c1",
    name: "نگار احمدی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "کاهش وزن",
    levelLabel: "متوسط",
    lastSessionLabel: "۲ روز پیش",
    progressPercent: 72,
    engagement: "active",
    nextSessionLabel: "شنبه ۱۷:۰۰",
  },
  {
    id: "c2",
    name: "علی رضایی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "افزایش حجم عضلانی",
    levelLabel: "پیشرفته",
    lastSessionLabel: "دیروز",
    progressPercent: 85,
    engagement: "active",
    nextSessionLabel: "یکشنبه ۰۸:۰۰",
  },
  {
    id: "c3",
    name: "مریم کریمی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "آمادگی جسمانی عمومی",
    levelLabel: "مبتدی",
    lastSessionLabel: "۱۲ روز پیش",
    progressPercent: 34,
    engagement: "at-risk",
  },
  {
    id: "c4",
    name: "حسین موسوی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "قدرت و پاورلیفتینگ",
    levelLabel: "پیشرفته",
    lastSessionLabel: "۳ روز پیش",
    progressPercent: 64,
    engagement: "active",
    nextSessionLabel: "دوشنبه ۱۹:۳۰",
  },
  {
    id: "c5",
    name: "سمیرا نادری",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "تناسب اندام پس از بارداری",
    levelLabel: "مبتدی",
    lastSessionLabel: "۱ ماه پیش",
    progressPercent: 18,
    engagement: "paused",
  },
  {
    id: "c6",
    name: "رضا قاسمی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "کاهش چربی شکمی",
    levelLabel: "متوسط",
    lastSessionLabel: "۹ روز پیش",
    progressPercent: 41,
    engagement: "at-risk",
  },
  {
    id: "c7",
    name: "الهام شریفی",
    avatar: PLACEHOLDER_IMAGE,
    goalLabel: "آمادگی مسابقه کراس‌فیت",
    levelLabel: "پیشرفته",
    lastSessionLabel: "امروز",
    progressPercent: 91,
    engagement: "active",
    nextSessionLabel: "فردا ۰۷:۰۰",
  },
];

const SHARED_DETAIL = {
  trendPoints: [
    { label: "فروردین", value: 86 },
    { label: "اردیبهشت", value: 84 },
    { label: "خرداد", value: 82.5 },
    { label: "تیر", value: 81 },
    { label: "مرداد", value: 79.5 },
    { label: "شهریور", value: 78 },
  ],
  monthlySessionsSeries: [6, 8, 7, 9, 10, 12],
  adherenceSeries: [60, 66, 72, 70, 78, 84],
  monthlySessionsValue: "۱۲",
  adherenceValue: "۸۴",
  upcomingSessions: [
    {
      id: "u1",
      dateLabel: "شنبه ۲۵ مرداد، ۱۷:۰۰",
      typeLabel: "جلسه خصوصی قدرتی",
      status: "CONFIRMED",
    },
    {
      id: "u2",
      dateLabel: "سه‌شنبه ۲۸ مرداد، ۰۸:۰۰",
      typeLabel: "کاردیو و هوازی",
      status: "CONFIRMED",
    },
  ] as CoachClientSession[],
  sessionHistory: [
    {
      id: "h1",
      dateLabel: "چهارشنبه ۲۱ مرداد",
      typeLabel: "جلسه خصوصی قدرتی",
      status: "COMPLETED",
    },
    {
      id: "h2",
      dateLabel: "یکشنبه ۱۸ مرداد",
      typeLabel: "تمرین مرکزی بدن",
      status: "COMPLETED",
    },
    {
      id: "h3",
      dateLabel: "پنجشنبه ۱۵ مرداد",
      typeLabel: "کاردیو و هوازی",
      status: "NO_SHOW",
    },
    {
      id: "h4",
      dateLabel: "دوشنبه ۱۲ مرداد",
      typeLabel: "جلسه خصوصی قدرتی",
      status: "CANCELLED",
    },
  ] as CoachClientSession[],
  note: "تمرکز این دوره روی فرم صحیح حرکات پایه است. حرکت اسکوات با هالتر هنوز نیاز به اصلاح دارد و بهتر است وزنه‌ها به‌تدریج اضافه شود. رژیم غذایی با مشاور تغذیه هماهنگ شده است.",
};

export const COACH_CLIENT_DETAILS: CoachClientDetail[] = COACH_CLIENTS.map(
  (client) => ({
    ...client,
    ...SHARED_DETAIL,
  }),
);

export function getAllCoachClientIds(): string[] {
  return COACH_CLIENTS.map((client) => client.id);
}

export function getCoachClientDetail(
  clientId: string,
): CoachClientDetail | undefined {
  return COACH_CLIENT_DETAILS.find((client) => client.id === clientId);
}
