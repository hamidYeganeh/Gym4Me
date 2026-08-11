import type { BookingsListQuery } from "./bookings.dto";

export const accountBookingsKeys = {
  all: ["account", "bookings"] as const,
  lists: () => [...accountBookingsKeys.all, "list"] as const,
  list: (query: BookingsListQuery = {}) =>
    [...accountBookingsKeys.lists(), query] as const,
  details: () => [...accountBookingsKeys.all, "detail"] as const,
  detail: (id: string) => [...accountBookingsKeys.details(), id] as const,
};
