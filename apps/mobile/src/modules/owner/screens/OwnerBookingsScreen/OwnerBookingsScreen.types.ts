import type { BookingResourceType, BookingStatus } from "@repo/api";
import type { OwnerBookingView } from "../../lib/owner-bookings-data";

export type OwnerBookingsFilter = "active" | "past" | "cancelled" | "all";

export type OwnerBookingAction =
  | "check-in"
  | "complete"
  | "no-show"
  | "cancel";

export type OwnerBookingClubOption = { id: string; name: string };
export type OwnerBookingOccurrenceOption = {
  value: string;
  label: string;
  resourceType: BookingResourceType;
};

export type OwnerBookingsScreenProps = {
  bookings: OwnerBookingView[];
  clubs: OwnerBookingClubOption[];
  selectedClubId: string;
  filter: OwnerBookingsFilter;
  search: string;
  loading?: boolean;
  loadingMore?: boolean;
  pendingBookingId?: string;
  error?: string;
  hasMore?: boolean;
  occurrenceOptions?: OwnerBookingOccurrenceOption[];
  occurrencesLoading?: boolean;
  onClubChange: (clubId: string) => void;
  onFilterChange: (filter: OwnerBookingsFilter) => void;
  onSearchChange: (search: string) => void;
  onRetry?: () => void;
  onLoadMore?: () => void;
  onAction?: (booking: OwnerBookingView, action: OwnerBookingAction) => Promise<void> | void;
  onReschedule?: (booking: OwnerBookingView, value: string) => Promise<void> | void;
  className?: string;
};

export const OWNER_BOOKING_STATUS_COLORS: Record<
  BookingStatus,
  "default" | "success" | "warning" | "danger" | "accent"
> = {
  pending: "warning",
  awaiting_payment: "warning",
  confirmed: "success",
  checked_in: "accent",
  completed: "default",
  cancelled: "danger",
  no_show: "danger",
  refund_requested: "warning",
  refunded: "default",
  rejected: "danger",
};
