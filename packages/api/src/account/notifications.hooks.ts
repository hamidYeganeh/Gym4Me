import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountNotificationsApi,
  type AccountNotificationsApi,
} from "./notifications.client";
import type {
  ListNotificationsQuery,
  NotificationInbox,
  RegisterDeviceInput,
  RegisterDeviceResult,
} from "./notifications.dto";
import { accountNotificationsKeys } from "./notifications.keys";

function useAccountNotificationsApi(): AccountNotificationsApi {
  const client = useApiClient();
  return useMemo(() => createAccountNotificationsApi(client), [client]);
}

export function useNotificationsInbox(
  query: ListNotificationsQuery = {},
  options?: Omit<
    UseQueryOptions<NotificationInbox, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountNotificationsApi();
  return useQuery({
    queryKey: accountNotificationsKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useMarkNotificationRead(
  options?: UseMutationOptions<{ ok: boolean }, Error, { id: string }>,
) {
  const api = useAccountNotificationsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.markRead(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountNotificationsKeys.all,
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useMarkAllNotificationsRead(
  options?: UseMutationOptions<{ modified: number }, Error, void>,
) {
  const api = useAccountNotificationsApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: () => api.markAllRead(),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountNotificationsKeys.all,
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useRegisterDevice(
  options?: UseMutationOptions<RegisterDeviceResult, Error, RegisterDeviceInput>,
) {
  const api = useAccountNotificationsApi();
  return useMutation({
    ...(options ?? {}),
    mutationFn: (input) => api.registerDevice(input),
  });
}

export function useRevokeDevice(
  options?: UseMutationOptions<{ ok: boolean }, Error, { token: string }>,
) {
  const api = useAccountNotificationsApi();
  return useMutation({
    ...(options ?? {}),
    mutationFn: ({ token }) => api.revokeDevice(token),
  });
}
