import type { AdminBookingsListQuery } from "./bookings.dto";

export const adminBookingsKeys = {
  all: ["admin", "bookings"] as const,
  lists: () => [...adminBookingsKeys.all, "list"] as const,
  list: (query: AdminBookingsListQuery = {}) =>
    [...adminBookingsKeys.lists(), query] as const,
  details: () => [...adminBookingsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminBookingsKeys.details(), id] as const,
};
