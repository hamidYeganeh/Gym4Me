import type { ApiClient } from "../../core/client";
import type {
  AnnouncementInput,
  ApiEntity,
  NotificationListParams,
  NotificationPreferenceInput,
  DeviceRegistrationInput,
} from "./types";
const e = encodeURIComponent;
async function list(c: ApiClient, path: string, p: NotificationListParams = {}, s?: AbortSignal) {
  const r = await c.get<ApiEntity[]>(path, { query: p as any, ...(s ? { signal: s } : {}) });
  return { items: r.data, meta: r.meta, pagination: (r.meta as any).pagination };
}
export const notificationsApi = {
  mine: (c: ApiClient, p: NotificationListParams = {}, s?: AbortSignal) =>
    list(c, "/notifications/me", p, s),
  read: async (c: ApiClient, id: string) =>
    (await c.patch<ApiEntity>(`/notifications/${e(id)}/read`, {})).data,
  readAll: async (c: ApiClient) => (await c.post<ApiEntity>("/notifications/me/read-all", {})).data,
  preferences: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity>("/notifications/preferences/me", s ? { signal: s } : undefined)).data,
  updatePreferences: async (c: ApiClient, input: NotificationPreferenceInput) =>
    (await c.patch<ApiEntity>("/notifications/preferences/me", input)).data,
  devices: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/notifications/devices/me", s ? { signal: s } : undefined)).data,
  registerDevice: async (c: ApiClient, input: DeviceRegistrationInput) =>
    (await c.post<ApiEntity>("/notifications/devices/me", input)).data,
  revokeDevice: async (c: ApiClient, installationId: string) =>
    (await c.post<ApiEntity>(`/notifications/devices/${e(installationId)}/revoke`, {})).data,
  announcements: (c: ApiClient, org: string, p: NotificationListParams = {}, s?: AbortSignal) =>
    list(c, `/organizations/${e(org)}/announcements`, p, s),
  createAnnouncement: async (c: ApiClient, org: string, input: AnnouncementInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(org)}/announcements`, input)).data,
  publishAnnouncement: async (c: ApiClient, org: string, id: string) =>
    (await c.post<ApiEntity>(`/organizations/${e(org)}/announcements/${e(id)}/publish`, {})).data,
  adminJobs: (c: ApiClient, p: NotificationListParams = {}, s?: AbortSignal) =>
    list(c, "/admin/notifications/jobs", p, s),
  adminTemplates: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/admin/notifications/templates", s ? { signal: s } : undefined))
      .data,
  retry: async (c: ApiClient, id: string, reason: string) =>
    (await c.post<ApiEntity>(`/admin/notifications/jobs/${e(id)}/retry`, { reason })).data,
};
