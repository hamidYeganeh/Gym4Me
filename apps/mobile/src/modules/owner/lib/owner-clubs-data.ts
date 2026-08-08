import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type OwnerClubState = "active" | "pending-review" | "suspended";

export type OwnerClub = {
  id: string;
  name: string;
  image: string;
  city: string;
  branchCount: string;
  memberCount: string;
  occupancyPercent: number;
  state: OwnerClubState;
  revenueMonthLabel: string;
};

export const OWNER_CLUBS: OwnerClub[] = [
  {
    id: "heavenly",
    name: "آسمانی فیتنس",
    image: PLACEHOLDER_IMAGE,
    city: "تهران",
    branchCount: "۳",
    memberCount: "۴۸۲",
    occupancyPercent: 78,
    state: "active",
    revenueMonthLabel: "درآمد این ماه: ۴۲ میلیون تومان",
  },
  {
    id: "pulse",
    name: "پالس فیت",
    image: PLACEHOLDER_IMAGE,
    city: "اصفهان",
    branchCount: "۱",
    memberCount: "۱۶۴",
    occupancyPercent: 54,
    state: "active",
    revenueMonthLabel: "درآمد این ماه: ۱۸ میلیون تومان",
  },
  {
    id: "titan",
    name: "تایتان کلاب",
    image: PLACEHOLDER_IMAGE,
    city: "شیراز",
    branchCount: "۲",
    memberCount: "۹۶",
    occupancyPercent: 22,
    state: "pending-review",
    revenueMonthLabel: "در انتظار فعال‌سازی",
  },
  {
    id: "aria",
    name: "آریا اسپرت",
    image: PLACEHOLDER_IMAGE,
    city: "تهران",
    branchCount: "۱",
    memberCount: "۵۸",
    occupancyPercent: 8,
    state: "suspended",
    revenueMonthLabel: "درآمد این ماه: —",
  },
];
