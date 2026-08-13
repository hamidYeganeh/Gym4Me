import type { ListNotificationsQuery } from "./notifications.dto";

export const accountNotificationsKeys = {
  all: ["account", "notifications"] as const,
  list: (query: ListNotificationsQuery = {}) =>
    [...accountNotificationsKeys.all, "list", query] as const,
  preferences: () =>
    [...accountNotificationsKeys.all, "preferences"] as const,
};
