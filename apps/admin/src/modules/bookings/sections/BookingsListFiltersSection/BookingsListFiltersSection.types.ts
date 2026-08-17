import type { BookingStatus } from "@repo/api";

export type BookingsListFiltersSectionProps = {
  statusFilter: BookingStatus | "all";
  onStatusChange: (value: BookingStatus | "all") => void;
  className?: string;
};

export const BOOKING_STATUS_FILTERS: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "awaiting_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
  "refund_requested",
  "refunded",
  "rejected",
];

export const CANCELLABLE: BookingStatus[] = [
  "pending",
  "awaiting_payment",
  "confirmed",
];

export const REFUNDABLE: BookingStatus[] = ["refund_requested", "cancelled"];
