import type { ListCalendarBlocksQuery } from "./calendar.dto";

export const accountCalendarKeys = {
  all: ["account", "calendar"] as const,
  clubBlocks: (clubId: string, query: ListCalendarBlocksQuery = {}) =>
    [...accountCalendarKeys.all, "club-blocks", clubId, query] as const,
  coachBlocks: (query: ListCalendarBlocksQuery = {}) =>
    [...accountCalendarKeys.all, "coach-blocks", query] as const,
};
