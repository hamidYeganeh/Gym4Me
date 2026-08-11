import type { BookingsListQuery } from "./bookings.dto";

export const clubBookingsKeys = {
  all: ["club-owner", "bookings"] as const,
  lists: (clubId: string) =>
    [...clubBookingsKeys.all, "list", clubId] as const,
  list: (clubId: string, query: BookingsListQuery = {}) =>
    [...clubBookingsKeys.lists(clubId), query] as const,
  details: (clubId: string) =>
    [...clubBookingsKeys.all, "detail", clubId] as const,
  detail: (clubId: string, id: string) =>
    [...clubBookingsKeys.details(clubId), id] as const,
};
