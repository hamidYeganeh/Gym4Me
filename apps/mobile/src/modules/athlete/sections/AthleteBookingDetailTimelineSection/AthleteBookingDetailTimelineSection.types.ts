import type { UseAthleteBookingDetailReturn } from "@/modules/athlete/lib/use-athlete-booking-detail";

export type AthleteBookingDetailTimelineSectionProps = Pick<
  UseAthleteBookingDetailReturn,
  "t" | "currentStepIndex"
>;
