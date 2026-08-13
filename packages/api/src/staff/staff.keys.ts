import type { ListStaffQuery } from "./staff.dto";

export const clubStaffKeys = {
  all: ["account", "clubs", "staff"] as const,
  lists: (clubId: string) => [...clubStaffKeys.all, clubId] as const,
  list: (clubId: string, query: ListStaffQuery = {}) =>
    [...clubStaffKeys.lists(clubId), query] as const,
};
