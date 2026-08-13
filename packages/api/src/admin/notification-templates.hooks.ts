import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminNotificationTemplatesApi,
  type AdminNotificationTemplatesApi,
} from "./notification-templates.client";
import type {
  CreateNotificationTemplateInput,
  ListNotificationTemplatesQuery,
  NotificationTemplate,
  NotificationTemplatesResponse,
  UpdateNotificationTemplateInput,
} from "./notification-templates.dto";
import { adminNotificationTemplatesKeys } from "./notification-templates.keys";

function useAdminNotificationTemplatesApi(): AdminNotificationTemplatesApi {
  const client = useApiClient();
  return useMemo(
    () => createAdminNotificationTemplatesApi(client),
    [client],
  );
}

export function useAdminNotificationTemplates(
  query: ListNotificationTemplatesQuery = {},
  options?: Omit<
    UseQueryOptions<NotificationTemplatesResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminNotificationTemplatesApi();
  return useQuery({
    queryKey: adminNotificationTemplatesKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useAdminNotificationTemplate(
  key: string,
  options?: Omit<
    UseQueryOptions<NotificationTemplate, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminNotificationTemplatesApi();
  return useQuery({
    queryKey: adminNotificationTemplatesKeys.detail(key),
    queryFn: () => api.get(key),
    ...options,
    enabled: Boolean(key) && (options?.enabled ?? true),
  });
}

export function useCreateAdminNotificationTemplate() {
  const api = useAdminNotificationTemplatesApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNotificationTemplateInput) => api.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminNotificationTemplatesKeys.all,
      });
    },
  });
}

export function useUpdateAdminNotificationTemplate() {
  const api = useAdminNotificationTemplatesApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      key,
      input,
    }: {
      key: string;
      input: UpdateNotificationTemplateInput;
    }) => api.update(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminNotificationTemplatesKeys.all,
      });
    },
  });
}
