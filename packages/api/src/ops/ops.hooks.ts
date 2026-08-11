import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import { createAccountOpsApi, type AccountOpsApi } from "./ops.client";
import type {
  CreateOwnerTaskInput,
  ListOwnerTasksQuery,
  OwnerTasksPage,
  OwnerTasksSummary,
  UpdateOwnerTaskStatusInput,
} from "./ops.dto";
import { accountOpsKeys } from "./ops.keys";

function useAccountOpsApi(): AccountOpsApi {
  const client = useApiClient();
  return useMemo(() => createAccountOpsApi(client), [client]);
}

export function useOwnerTasks(
  clubId: string,
  query: ListOwnerTasksQuery = {},
  options?: Omit<
    UseQueryOptions<OwnerTasksPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountOpsApi();
  return useQuery({
    queryKey: accountOpsKeys.tasks(clubId, query),
    queryFn: () => api.listTasks(clubId, query),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useOwnerTasksSummary(
  clubId: string,
  options?: Omit<
    UseQueryOptions<OwnerTasksSummary, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountOpsApi();
  return useQuery({
    queryKey: accountOpsKeys.summary(clubId),
    queryFn: () => api.tasksSummary(clubId),
    ...options,
    enabled: Boolean(clubId) && (options?.enabled ?? true),
  });
}

export function useCreateOwnerTask(clubId: string) {
  const api = useAccountOpsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOwnerTaskInput) =>
      api.createTask(clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountOpsKeys.all });
    },
  });
}

export function useUpdateOwnerTaskStatus(clubId: string) {
  const api = useAccountOpsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: string;
      input: UpdateOwnerTaskStatusInput;
    }) => api.updateTaskStatus(clubId, taskId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountOpsKeys.all });
    },
  });
}
