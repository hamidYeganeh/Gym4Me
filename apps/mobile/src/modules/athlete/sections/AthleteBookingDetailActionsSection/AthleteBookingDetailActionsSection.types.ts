import type { UseAthleteBookingDetailReturn } from "@/modules/athlete/lib/use-athlete-booking-detail";

export type AthleteBookingDetailActionsSectionProps = Pick<
  UseAthleteBookingDetailReturn,
  | "t"
  | "booking"
  | "router"
  | "isApiBooking"
  | "isCancelConfirmOpen"
  | "setIsCancelConfirmOpen"
  | "isCancelRequested"
  | "cancelReasonKey"
  | "setCancelReasonKey"
  | "cancelNote"
  | "setCancelNote"
  | "isActing"
  | "actionError"
  | "cancellationPreview"
  | "showPayAction"
  | "showCancelAction"
  | "showRescheduleAction"
  | "onPay"
  | "onConfirmCancel"
  | "openCancelPreview"
>;
