import type { BookingsListQuery } from "./bookings.dto";

export const coachBookingsKeys = {
  all: ["coach", "bookings"] as const,
  lists: () => [...coachBookingsKeys.all, "list"] as const,
  list: (query: BookingsListQuery = {}) =>
    [...coachBookingsKeys.lists(), query] as const,
  details: () => [...coachBookingsKeys.all, "detail"] as const,
  detail: (id: string) => [...coachBookingsKeys.details(), id] as const,
};
