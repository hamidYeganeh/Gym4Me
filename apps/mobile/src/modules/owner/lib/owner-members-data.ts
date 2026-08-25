import { statsColors } from "@repo/theme/stats-colors";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type OwnerMembershipState =
  | "active"
  | "expiring"
  | "frozen"
  | "expired";

export type OwnerMember = {
  id: string;
  /** Present for app-account holders (needed for desk check-in). */
  holderUserId?: string;
  clubId?: string;
  name: string;
  avatar: string;
  planName: string;
  joinedLabel: string;
  expiresLabel: string;
  sessionsUsed: number;
  sessionsTotal: number;
  membershipState: OwnerMembershipState;
  lastCheckInLabel: string;
  renewalEligible?: boolean;
};

export type OwnerMembersStats = {
  activeValue: number;
  activeSeries: number[];
  activeComparisonSeries: number[];
  activeColor: string;
  weekValue: number;
  weekSeries: number[];
  weekColor: string;
};

export const OWNER_MEMBERS_STATS: OwnerMembersStats = {
  activeValue: 248,
  activeSeries: [180, 196, 190, 214, 208, 236, 248],
  activeComparisonSeries: [160, 172, 170, 188, 184, 200, 210],
  activeColor: statsColors.blue,
  weekValue: 96,
  weekSeries: [52, 68, 60, 84, 76, 90, 96],
  weekColor: statsColors.purple,
};

export const OWNER_MEMBERS: OwnerMember[] = [
  {
    id: "sara",
    name: "سارا محمدی",
    avatar: "/demo/coach-portrait.png",
    planName: "پلن ویژه سه‌ماهه",
    joinedLabel: "عضویت از ۱۲ فروردین ۱۴۰۴",
    expiresLabel: "اعتبار تا ۱۲ تیر ۱۴۰۴",
    sessionsUsed: 18,
    sessionsTotal: 36,
    membershipState: "active",
    lastCheckInLabel: "آخرین حضور: امروز، ۰۸:۳۰",
  },
  {
    id: "ali",
    name: "علی رضایی",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن پایه ماهانه",
    joinedLabel: "عضویت از ۳ اردیبهشت ۱۴۰۴",
    expiresLabel: "اعتبار تا ۳ خرداد ۱۴۰۴",
    sessionsUsed: 10,
    sessionsTotal: 12,
    membershipState: "expiring",
    lastCheckInLabel: "آخرین حضور: دیروز، ۱۹:۱۰",
  },
  {
    id: "nika",
    name: "نیکا احمدی",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن ویژه شش‌ماهه",
    joinedLabel: "عضویت از ۲۰ بهمن ۱۴۰۳",
    expiresLabel: "اعتبار تا ۲۰ مرداد ۱۴۰۴",
    sessionsUsed: 44,
    sessionsTotal: 72,
    membershipState: "active",
    lastCheckInLabel: "آخرین حضور: امروز، ۱۰:۰۵",
  },
  {
    id: "mehdi",
    name: "مهدی کریمی",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن پایه سه‌ماهه",
    joinedLabel: "عضویت از ۸ اسفند ۱۴۰۳",
    expiresLabel: "فریز از ۱۵ اردیبهشت ۱۴۰۴",
    sessionsUsed: 16,
    sessionsTotal: 36,
    membershipState: "frozen",
    lastCheckInLabel: "آخرین حضور: ۱۴ اردیبهشت ۱۴۰۴",
  },
  {
    id: "maryam",
    name: "مریم حسینی",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن ویژه ماهانه",
    joinedLabel: "عضویت از ۱ خرداد ۱۴۰۴",
    expiresLabel: "اعتبار تا ۱ تیر ۱۴۰۴",
    sessionsUsed: 3,
    sessionsTotal: 16,
    membershipState: "active",
    lastCheckInLabel: "آخرین حضور: امروز، ۰۷:۴۵",
  },
  {
    id: "reza",
    name: "رضا نوری",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن پایه ماهانه",
    joinedLabel: "عضویت از ۵ فروردین ۱۴۰۴",
    expiresLabel: "منقضی از ۵ اردیبهشت ۱۴۰۴",
    sessionsUsed: 12,
    sessionsTotal: 12,
    membershipState: "expired",
    lastCheckInLabel: "آخرین حضور: ۲ اردیبهشت ۱۴۰۴",
  },
  {
    id: "parisa",
    name: "پریسا کاظمی",
    avatar: PLACEHOLDER_IMAGE,
    planName: "پلن ویژه سه‌ماهه",
    joinedLabel: "عضویت از ۲۵ فروردین ۱۴۰۴",
    expiresLabel: "اعتبار تا ۲۵ تیر ۱۴۰۴",
    sessionsUsed: 21,
    sessionsTotal: 36,
    membershipState: "expiring",
    lastCheckInLabel: "آخرین حضور: دیروز، ۱۷:۲۰",
  },
];
