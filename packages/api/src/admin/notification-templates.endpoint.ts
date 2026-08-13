/** Notification template management (`/admin/notifications/templates`). */
export const adminNotificationTemplatesEndpoints = {
  root: "/admin/notifications/templates",
  byKey: (key: string) =>
    `/admin/notifications/templates/${encodeURIComponent(key)}`,
} as const;
