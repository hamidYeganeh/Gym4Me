"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { notificationsApi } from "./api";
import { notificationKeys } from "./queries";
import type {
  AnnouncementInput,
  DeviceRegistrationInput,
  NotificationPreferenceInput,
} from "./types";
export function useReadNotificationMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.read(c, id),
    onSuccess: async () => q.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
export function useReadAllNotificationsMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.readAll(c),
    onSuccess: async () => q.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
export function useUpdateNotificationPreferencesMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationPreferenceInput) =>
      notificationsApi.updatePreferences(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: notificationKeys.preferences }),
  });
}
export function useRegisterDeviceMutation() {
  const c = useApiClient();
  return useMutation({
    mutationFn: (input: DeviceRegistrationInput) => notificationsApi.registerDevice(c, input),
  });
}
export function useRevokeDeviceMutation() {
  const c = useApiClient();
  return useMutation({
    mutationFn: (installationId: string) => notificationsApi.revokeDevice(c, installationId),
  });
}
export function useCreateAnnouncementMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementInput) => notificationsApi.createAnnouncement(c, org, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["notifications", "announcements", org] }),
  });
}
export function usePublishAnnouncementMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.publishAnnouncement(c, org, id),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["notifications", "announcements", org] }),
  });
}
export function useRetryNotificationMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      notificationsApi.retry(c, id, reason),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["admin", "notifications", "jobs"] }),
  });
}
