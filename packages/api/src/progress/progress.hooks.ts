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
  CreateExerciseInput,
  CreatePersonalRecordInput,
  CreateProgressMetricInput,
  CreateProgressPhotoInput,
  CreateWorkoutLogInput,
  CreateWorkoutPlanInput,
  CreateWorkoutProgramInput,
  ExercisesPage,
  ListExercisesQuery,
  ListMetricTypesQuery,
  ListPersonalRecordsQuery,
  ListProgressMetricsQuery,
  ListProgressPhotosQuery,
  ListWorkoutLogsQuery,
  ListWorkoutPlansQuery,
  ListWorkoutProgramsQuery,
  MetricTypesPage,
  PersonalRecordsPage,
  ProgressMetricsPage,
  ProgressPhotosPage,
  UpdateProgressMetricInput,
  UpdateProgressPhotoInput,
  UpdateWorkoutPlanInput,
  UpdateWorkoutProgramInput,
  WorkoutLogsPage,
  WorkoutPlan,
  WorkoutPlansPage,
  WorkoutProgram,
  WorkoutProgramsPage,
} from "./progress.dto";
import { accountProgressKeys } from "./progress.keys";

function useAccountProgressApi(): AccountProgressApi {
  const client = useApiClient();
  return useMemo(() => createAccountProgressApi(client), [client]);
}

export function useExercises(
  query: ListExercisesQuery = {},
  options?: Omit<
    UseQueryOptions<ExercisesPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.exercises(query),
    queryFn: () => api.listExercises(query),
    ...options,
  });
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

export function useWorkoutProgram(
  id: string,
  options?: Omit<
    UseQueryOptions<WorkoutProgram, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.workoutProgram(id),
    queryFn: () => api.getWorkoutProgram(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useWorkoutPlans(
  query: ListWorkoutPlansQuery = {},
  options?: Omit<
    UseQueryOptions<WorkoutPlansPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.workoutPlans(query),
    queryFn: () => api.listWorkoutPlans(query),
    ...options,
  });
}

export function useWorkoutPlan(
  id: string,
  options?: Omit<UseQueryOptions<WorkoutPlan, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.workoutPlan(id),
    queryFn: () => api.getWorkoutPlan(id),
    ...options,
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useProgressMetrics(
  query: ListProgressMetricsQuery = {},
  options?: Omit<
    UseQueryOptions<ProgressMetricsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.metrics(query),
    queryFn: () => api.listMetrics(query),
    ...options,
  });
}

export function useProgressPhotos(
  query: ListProgressPhotosQuery = {},
  options?: Omit<
    UseQueryOptions<ProgressPhotosPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.photos(query),
    queryFn: () => api.listPhotos(query),
    ...options,
  });
}

export function useWorkoutLogs(
  query: ListWorkoutLogsQuery = {},
  options?: Omit<
    UseQueryOptions<WorkoutLogsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.workoutLogs(query),
    queryFn: () => api.listWorkoutLogs(query),
    ...options,
  });
}

export function usePersonalRecords(
  query: ListPersonalRecordsQuery = {},
  options?: Omit<
    UseQueryOptions<PersonalRecordsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountProgressApi();
  return useQuery({
    queryKey: accountProgressKeys.personalRecords(query),
    queryFn: () => api.listPersonalRecords(query),
    ...options,
  });
}

export function useSubmitExercise() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => api.submitExercise(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
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

export function useCreateWorkoutPlan() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkoutPlanInput) =>
      api.createWorkoutPlan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useUpdateWorkoutPlan() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateWorkoutPlanInput;
    }) => api.updateWorkoutPlan(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useDeleteWorkoutPlan() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteWorkoutPlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useCreateProgressMetric() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProgressMetricInput) =>
      api.createMetric(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useUpdateProgressMetric() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProgressMetricInput;
    }) => api.updateMetric(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useDeleteProgressMetric() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMetric(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useCreateProgressPhoto() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProgressPhotoInput) => api.createPhoto(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useUpdateProgressPhoto() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProgressPhotoInput;
    }) => api.updatePhoto(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useDeleteProgressPhoto() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePhoto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useCreateWorkoutLog() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkoutLogInput) => api.createWorkoutLog(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export function useCreatePersonalRecord() {
  const api = useAccountProgressApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonalRecordInput) =>
      api.createPersonalRecord(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: accountProgressKeys.all,
      });
    },
  });
}

export type { WorkoutProgram };
