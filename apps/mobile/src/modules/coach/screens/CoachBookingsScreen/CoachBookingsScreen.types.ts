import type {
  CoachBookingAction,
  CoachBookingRequest,
} from "../../lib/coach-bookings-data";

export type CoachBookingsScreenProps = {
  bookings: CoachBookingRequest[];
  /** Present in live mode — runs the API action, then the gate refreshes. */
  onAction?: (bookingId: string, action: CoachBookingAction) => Promise<void>;
};
