import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAdminProgressApi,
  type AdminProgressApi,
} from "./progress.client";
import type {
  AdminExercisesPage,
  AdminMetricTypesPage,
  CreateExerciseInput,
  CreateMetricTypeInput,
  ListAdminExercisesQuery,
  ListAdminMetricTypesQuery,
  UpdateExerciseInput,
  UpdateMetricTypeInput,
  VerifyExerciseInput,
} from "./progress.dto";
import { adminProgressKeys } from "./progress.keys";

function useAdminProgressApi(): AdminProgressApi {
  const client = useApiClient();
  return useMemo(() => createAdminProgressApi(client), [client]);
}

export function useAdminExercises(
  query: ListAdminExercisesQuery = {},
  options?: Omit<
    UseQueryOptions<AdminExercisesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminProgressApi();
  return useQuery({
    queryKey: adminProgressKeys.exercises(query),
    queryFn: () => api.listExercises(query),
    ...options,
  });
}

export function useCreateAdminExercise() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => api.createExercise(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useUpdateAdminExercise() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExerciseInput }) =>
      api.updateExercise(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useVerifyAdminExercise() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VerifyExerciseInput }) =>
      api.verifyExercise(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useArchiveAdminExercise() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveExercise(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useAdminMetricTypes(
  query: ListAdminMetricTypesQuery = {},
  options?: Omit<
    UseQueryOptions<AdminMetricTypesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminProgressApi();
  return useQuery({
    queryKey: adminProgressKeys.metricTypes(query),
    queryFn: () => api.listMetricTypes(query),
    ...options,
  });
}

export function useCreateAdminMetricType() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMetricTypeInput) => api.createMetricType(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useUpdateAdminMetricType() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateMetricTypeInput;
    }) => api.updateMetricType(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}

export function useArchiveAdminMetricType() {
  const api = useAdminProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.archiveMetricType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProgressKeys.all });
    },
  });
}
