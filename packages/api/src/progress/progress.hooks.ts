import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import {
  createAccountProgressApi,
  type AccountProgressApi,
} from "./progress.client";
import type {
  AssignWorkoutProgramInput,
  CreateWorkoutProgramInput,
  ListMetricTypesQuery,
  ListWorkoutProgramsQuery,
  MetricTypesPage,
  UpdateWorkoutProgramInput,
  WorkoutProgram,
  WorkoutProgramsPage,
} from "./progress.dto";
import { accountProgressKeys } from "./progress.keys";

function useAccountProgressApi(): AccountProgressApi {
  const client = useApiClient();
  return useMemo(() => createAccountProgressApi(client), [client]);
}

export function useMetricTypes(
  query: ListMetricTypesQuery = {},
  options?: Omit<
    UseQueryOptions<MetricTypesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.metricTypes(query),
    queryFn: () => api.listMetricTypes(query),
    ...options,
  });
}

export function useWorkoutPrograms(
  query: ListWorkoutProgramsQuery = {},
  options?: Omit<
    UseQueryOptions<WorkoutProgramsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.workoutPrograms(query),
    queryFn: () => api.listWorkoutPrograms(query),
    ...options,
  });
}

export function useCreateWorkoutProgram() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkoutProgramInput) =>
      api.createWorkoutProgram(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useUpdateWorkoutProgram() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateWorkoutProgramInput;
    }) => api.updateWorkoutProgram(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useAssignWorkoutProgram() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: AssignWorkoutProgramInput;
    }) => api.assignWorkoutProgram(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export type { WorkoutProgram };
