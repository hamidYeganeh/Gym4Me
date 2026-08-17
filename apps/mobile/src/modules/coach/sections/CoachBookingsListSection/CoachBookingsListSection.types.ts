import type {
  BookingStatus,
  CoachBookingAction,
  CoachBookingRequest,
} from "../../lib/coach-bookings-data";

export type CoachBookingsListSectionProps = {
  tab: "requests" | "upcoming" | "past";
  items: CoachBookingRequest[];
  pendingId: string | null;
  hasApiActions: boolean;
  onAction?: (id: string, action: CoachBookingAction) => void | Promise<void>;
  onAcceptMock: (id: string) => void;
  onRejectMock: (id: string) => void;
  className?: string;
};

export const STATUS_CHIP_COLOR: Partial<
  Record<BookingStatus, "success" | "warning" | "danger" | "default">
> = {
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  CONFIRMED: "success",
  CHECKED_IN: "success",
  COMPLETED: "success",
  NO_SHOW: "warning",
  CANCELLED: "danger",
  REJECTED: "danger",
  REFUND_REQUESTED: "warning",
  REFUNDED: "default",
};

export const STATUS_LABEL_KEY: Partial<Record<BookingStatus, string>> = {
  PENDING: "statusPending",
  AWAITING_PAYMENT: "statusAwaitingPayment",
  CONFIRMED: "statusConfirmed",
  CHECKED_IN: "statusCheckedIn",
  COMPLETED: "statusCompleted",
  NO_SHOW: "statusNoShow",
  CANCELLED: "statusCancelled",
  REJECTED: "statusRejected",
  REFUND_REQUESTED: "statusRefundRequested",
  REFUNDED: "statusRefunded",
};

export const ACTION_LABEL_KEY: Record<CoachBookingAction, string> = {
  accept: "actionAccept",
  checkIn: "actionCheckIn",
  complete: "actionComplete",
  noShow: "actionNoShow",
  cancel: "actionCancel",
};
