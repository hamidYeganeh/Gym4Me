import { statsColors } from "@repo/theme";
import { PLACEHOLDER_IMAGE } from "@repo/ui/common";

export type OwnerHomeStatChart = "line" | "bar";

export type OwnerHomeStat = {
  id: string;
  titleKey:
    | "statMembers"
    | "statBookings"
    | "statRevenue"
    | "statOccupancy";
  unitKey:
    | "statMembersUnit"
    | "statBookingsUnit"
    | "statRevenueUnit"
    | "statOccupancyUnit";
  value: number;
  chart: OwnerHomeStatChart;
  color: string;
  series: number[];
  comparisonSeries?: number[];
};

export type OwnerHomeClub = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  ratingCount: number;
  price: string;
};

export const OWNER_HOME_STATS: OwnerHomeStat[] = [
  {
    id: "members",
    titleKey: "statMembers",
    unitKey: "statMembersUnit",
    value: 248,
    chart: "bar",
    color: statsColors.orange,
    series: [35, 48, 42, 68, 55, 72, 88],
  },
  {
    id: "bookings",
    titleKey: "statBookings",
    unitKey: "statBookingsUnit",
    value: 86,
    chart: "line",
    color: statsColors.blue,
    series: [40, 55, 48, 70, 62, 80, 86],
    comparisonSeries: [35, 42, 40, 50, 48, 55, 58],
  },
  {
    id: "revenue",
    titleKey: "statRevenue",
    unitKey: "statRevenueUnit",
    value: 42,
    chart: "bar",
    color: statsColors.purple,
    series: [22, 30, 28, 45, 38, 50, 42],
  },
  {
    id: "occupancy",
    titleKey: "statOccupancy",
    unitKey: "statOccupancyUnit",
    value: 78,
    chart: "line",
    color: statsColors.red,
    series: [50, 58, 62, 70, 68, 75, 78],
    comparisonSeries: [45, 50, 55, 58, 60, 62, 65],
  },
];

export const OWNER_HOME_TASKS_NEW_COUNT = 6;

export const OWNER_HOME_CLUBS: OwnerHomeClub[] = [
  {
    id: "heavenly",
    title: "آسمانی",
    subtitle: "تهران، ایران",
    image: PLACEHOLDER_IMAGE,
    rating: 4.8,
    ratingCount: 146,
    price: "۷۶۰٬۰۰۰",
  },
  {
    id: "pulse",
    title: "پالس فیت",
    subtitle: "اصفهان، ایران",
    image: PLACEHOLDER_IMAGE,
    rating: 4.6,
    ratingCount: 98,
    price: "۶۲۰٬۰۰۰",
  },
];
