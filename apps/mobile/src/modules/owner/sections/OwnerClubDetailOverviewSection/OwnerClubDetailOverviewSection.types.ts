import type { OwnerClubDetailTodayRow } from "@/modules/owner/lib/owner-club-detail-data";

export type OwnerClubDetailOverviewSectionProps = {
  revenueTitle: string;
  revenueUnit: string;
  revenueValue: number;
  revenueSeries: number[];
  revenueComparisonSeries: number[];
  attendanceTitle: string;
  attendanceUnit: string;
  attendanceValue: number;
  attendanceSeries: number[];
  occupancyTrendTitle: string;
  occupancyTrend: { label: string; value: number }[];
  todayTitle: string;
  todayRows: OwnerClubDetailTodayRow[];
  todayLabelFor: (id: OwnerClubDetailTodayRow["id"]) => string;
  className?: string;
};
