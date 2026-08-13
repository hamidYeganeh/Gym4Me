import type { ListCheckInsQuery } from "./checkin.dto";

export const accountCheckinKeys = {
  all: ["account", "checkin"] as const,
  mine: (query: ListCheckInsQuery = {}) =>
    [...accountCheckinKeys.all, "mine", query] as const,
  club: (clubId: string, query: ListCheckInsQuery = {}) =>
    [...accountCheckinKeys.all, "club", clubId, query] as const,
};
