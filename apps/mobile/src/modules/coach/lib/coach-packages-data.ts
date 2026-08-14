export type CoachPackageStatus = "active" | "archived";

export type CoachSessionPackage = {
  id: string;
  title: string;
  sessionCount: number;
  priceLabel: string;
  status: CoachPackageStatus;
  soldCount: number;
  updatedLabel: string;
};

export type CoachSoldPackage = {
  id: string;
  packageTitle: string;
  clientName: string;
  sessionsRemaining: number;
  purchasedLabel: string;
};

export const COACH_SESSION_PACKAGES: CoachSessionPackage[] = [
  {
    id: "pkg1",
    title: "بسته ۸ جلسه‌ای",
    sessionCount: 8,
    priceLabel: "۴,۸۰۰,۰۰۰ تومان",
    status: "active",
    soldCount: 14,
    updatedLabel: "به‌روزرسانی ۱ هفته پیش",
  },
  {
    id: "pkg2",
    title: "بسته ۴ جلسه‌ای",
    sessionCount: 4,
    priceLabel: "۲,۶۰۰,۰۰۰ تومان",
    status: "active",
    soldCount: 22,
    updatedLabel: "به‌روزرسانی ۳ روز پیش",
  },
  {
    id: "pkg3",
    title: "بسته ۱۲ جلسه VIP",
    sessionCount: 12,
    priceLabel: "۷,۲۰۰,۰۰۰ تومان",
    status: "archived",
    soldCount: 5,
    updatedLabel: "بایگانی ۲ ماه پیش",
  },
];

export const COACH_SOLD_PACKAGES: CoachSoldPackage[] = [
  {
    id: "sp1",
    packageTitle: "بسته ۸ جلسه‌ای",
    clientName: "امیر حسینی",
    sessionsRemaining: 3,
    purchasedLabel: "خرید ۱۴۰۳/۰۴/۱۰",
  },
  {
    id: "sp2",
    packageTitle: "بسته ۴ جلسه‌ای",
    clientName: "سارا رضایی",
    sessionsRemaining: 1,
    purchasedLabel: "خرید ۱۴۰۳/۰۵/۰۲",
  },
  {
    id: "sp3",
    packageTitle: "بسته ۸ جلسه‌ای",
    clientName: "رضا کریمی",
    sessionsRemaining: 6,
    purchasedLabel: "خرید ۱۴۰۳/۰۵/۱۵",
  },
];
