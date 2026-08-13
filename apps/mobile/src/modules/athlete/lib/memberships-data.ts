import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type MembershipState = "active" | "expiring" | "expired";

export type AthleteMembership = {
  id: string;
  clubId?: string;
  planId?: string;
  clubName: string;
  planName: string;
  image: string;
  state: MembershipState;
  sessionsUsed: number;
  sessionsTotal: number;
  expiresLabel: string;
  priceLabel: string;
};

export const ATHLETE_MEMBERSHIPS: AthleteMembership[] = [
  {
    id: "mem-1",
    clubName: "باشگاه انرژی",
    planName: "بسته ۱۲ جلسه‌ای بدنسازی",
    image: PLACEHOLDER_IMAGE,
    state: "expiring",
    sessionsUsed: 9,
    sessionsTotal: 12,
    expiresLabel: "اعتبار تا ۲۵ مرداد ۱۴۰۵",
    priceLabel: "۴٬۵۰۰٬۰۰۰ تومان",
  },
  {
    id: "mem-2",
    clubName: "باشگاه آرامش",
    planName: "بسته ۸ جلسه‌ای یوگا",
    image: PLACEHOLDER_IMAGE,
    state: "active",
    sessionsUsed: 2,
    sessionsTotal: 8,
    expiresLabel: "اعتبار تا ۱۰ شهریور ۱۴۰۵",
    priceLabel: "۲٬۴۰۰٬۰۰۰ تومان",
  },
  {
    id: "mem-3",
    clubName: "باشگاه آترین",
    planName: "بسته ماهانه کراس‌فیت",
    image: PLACEHOLDER_IMAGE,
    state: "expired",
    sessionsUsed: 12,
    sessionsTotal: 12,
    expiresLabel: "منقضی‌شده در ۳۱ تیر ۱۴۰۵",
    priceLabel: "۳٬۸۰۰٬۰۰۰ تومان",
  },
  {
    id: "mem-4",
    clubName: "مجموعه المپیک",
    planName: "بسته ۱۰ جلسه‌ای شنا",
    image: PLACEHOLDER_IMAGE,
    state: "expired",
    sessionsUsed: 10,
    sessionsTotal: 10,
    expiresLabel: "منقضی‌شده در ۲۰ خرداد ۱۴۰۵",
    priceLabel: "۵٬۰۰۰٬۰۰۰ تومان",
  },
];
