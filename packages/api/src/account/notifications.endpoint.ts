/** Notification inbox (`/account/notifications`) + push devices (`/account/devices`). */
export const accountNotificationsEndpoints = {
  list: "/account/notifications",
  preferences: "/account/notifications/preferences",
  readAll: "/account/notifications/read-all",
  read: (id: string) => `/account/notifications/${id}/read`,
  devices: "/account/devices",
  deviceByToken: (token: string) =>
    `/account/devices/${encodeURIComponent(token)}`,
} as const;
