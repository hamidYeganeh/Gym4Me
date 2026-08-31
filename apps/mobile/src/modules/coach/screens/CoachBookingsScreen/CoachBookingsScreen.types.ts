import type {
  CoachBookingAction,
  CoachBookingRequest,
} from "../../lib/coach-bookings-data";

export type CoachBookingsScreenProps = {
  bookings: CoachBookingRequest[];
  error?: string;
  /** Present in live mode — runs the API action, then the gate refreshes. */
  onAction?: (bookingId: string, action: CoachBookingAction) => Promise<void>;
  onRetry?: () => Promise<void> | void;
};
