"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { notificationsApi } from "./api";
import type { NotificationListParams } from "./types";
export const notificationKeys = {
  all: ["notifications"] as const,
  mine: (p: unknown) => ["notifications", "me", p] as const,
  preferences: ["notifications", "preferences"] as const,
  announcements: (o: string, p: unknown) => ["notifications", "announcements", o, p] as const,
  adminJobs: (p: unknown) => ["admin", "notifications", "jobs", p] as const,
  adminTemplates: ["admin", "notifications", "templates"] as const,
};
export function useMyNotificationsQuery(p: NotificationListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: notificationKeys.mine(p),
    queryFn: ({ signal }) => notificationsApi.mine(c, p, signal),
  });
}
export function useNotificationPreferencesQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: ({ signal }) => notificationsApi.preferences(c, signal),
  });
}
export function useAnnouncementsQuery(o: string, p: NotificationListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: notificationKeys.announcements(o, p),
    queryFn: ({ signal }) => notificationsApi.announcements(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useAdminNotificationJobsQuery(p: NotificationListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: notificationKeys.adminJobs(p),
    queryFn: ({ signal }) => notificationsApi.adminJobs(c, p, signal),
  });
}
export function useAdminNotificationTemplatesQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: notificationKeys.adminTemplates,
    queryFn: ({ signal }) => notificationsApi.adminTemplates(c, signal),
  });
}
