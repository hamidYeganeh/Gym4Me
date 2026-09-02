import type { UseAthleteBookingDetailReturn } from "@/modules/athlete/lib/use-athlete-booking-detail";

export type AthleteBookingDetailSummarySectionProps = Pick<
  UseAthleteBookingDetailReturn,
  "t" | "booking" | "showCheckIn" | "detailRows" | "isApiBooking" | "router"
> & {
  statusLabel: string;
  statusColor: "success" | "warning" | "accent" | "danger" | "default";
};
