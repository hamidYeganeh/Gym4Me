import type { ListWaitlistsQuery } from "./waitlist.dto";

export const accountWaitlistKeys = {
  all: ["account", "waitlist"] as const,
  mine: (query: ListWaitlistsQuery = {}) =>
    [...accountWaitlistKeys.all, "mine", query] as const,
  club: (clubId: string, query: ListWaitlistsQuery = {}) =>
    [...accountWaitlistKeys.all, "club", clubId, query] as const,
};
