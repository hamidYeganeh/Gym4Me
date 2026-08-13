import type { ListNotificationTemplatesQuery } from "./notification-templates.dto";

export const adminNotificationTemplatesKeys = {
  all: ["admin", "notification-templates"] as const,
  list: (query: ListNotificationTemplatesQuery = {}) =>
    [...adminNotificationTemplatesKeys.all, "list", query] as const,
  detail: (key: string) =>
    [...adminNotificationTemplatesKeys.all, "detail", key] as const,
};
