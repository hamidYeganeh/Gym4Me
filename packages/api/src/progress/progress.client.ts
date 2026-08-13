import type { ApiClient } from "../client";
import type {
  AssignWorkoutProgramInput,
  CreateExerciseInput,
  CreatePersonalRecordInput,
  CreateProgressMetricInput,
  CreateProgressPhotoInput,
  CreateWorkoutLogInput,
  CreateWorkoutPlanInput,
  CreateWorkoutProgramInput,
  DeleteOk,
  Exercise,
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
  PersonalRecord,
  PersonalRecordsPage,
  ProgressMetric,
  ProgressMetricsPage,
  SyncProgressMetricsInput,
  SyncProgressMetricsResult,
  ProgressPhoto,
  ProgressPhotosPage,
  UpdateProgressMetricInput,
  UpdateProgressPhotoInput,
  UpdateWorkoutPlanInput,
  UpdateWorkoutProgramInput,
  WorkoutLog,
  WorkoutLogsPage,
  WorkoutPlan,
  WorkoutPlansPage,
  WorkoutProgram,
  WorkoutProgramsPage,
} from "./progress.dto";
import { accountProgressEndpoints as ep } from "./progress.endpoint";

export function createAccountProgressApi(client: ApiClient) {
  return {
    listExercises(query: ListExercisesQuery = {}) {
      return client.request<ExercisesPage>(ep.exercises, { query });
    },

    submitExercise(input: CreateExerciseInput) {
      return client.request<Exercise>(ep.exercises, {
        method: "POST",
        body: input,
      });
    },

    listMetricTypes(query: ListMetricTypesQuery = {}) {
      return client.request<MetricTypesPage>(ep.metricTypes, { query });
    },

    listWorkoutPrograms(query: ListWorkoutProgramsQuery = {}) {
      return client.request<WorkoutProgramsPage>(ep.workoutPrograms, { query });
    },

    getWorkoutProgram(id: string) {
      return client.request<WorkoutProgram>(ep.workoutProgram(id));
    },

    createWorkoutProgram(input: CreateWorkoutProgramInput) {
      return client.request<WorkoutProgram>(ep.workoutPrograms, {
        method: "POST",
        body: input,
      });
    },

    updateWorkoutProgram(id: string, input: UpdateWorkoutProgramInput) {
      return client.request<WorkoutProgram>(ep.workoutProgram(id), {
        method: "PATCH",
        body: input,
      });
    },

    archiveWorkoutProgram(id: string) {
      return client.request<WorkoutProgram>(ep.workoutProgram(id), {
        method: "DELETE",
      });
    },

    assignWorkoutProgram(id: string, input: AssignWorkoutProgramInput) {
      return client.request<WorkoutPlan>(ep.assignWorkoutProgram(id), {
        method: "POST",
        body: input,
      });
    },

    listWorkoutPlans(query: ListWorkoutPlansQuery = {}) {
      return client.request<WorkoutPlansPage>(ep.workoutPlans, { query });
    },

    getWorkoutPlan(id: string) {
      return client.request<WorkoutPlan>(ep.workoutPlan(id));
    },

    createWorkoutPlan(input: CreateWorkoutPlanInput) {
      return client.request<WorkoutPlan>(ep.workoutPlans, {
        method: "POST",
        body: input,
      });
    },

    updateWorkoutPlan(id: string, input: UpdateWorkoutPlanInput) {
      return client.request<WorkoutPlan>(ep.workoutPlan(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteWorkoutPlan(id: string) {
      return client.request<WorkoutPlan>(ep.workoutPlan(id), {
        method: "DELETE",
      });
    },

    listMetrics(query: ListProgressMetricsQuery = {}) {
      return client.request<ProgressMetricsPage>(ep.metrics, { query });
    },

    createMetric(input: CreateProgressMetricInput) {
      return client.request<ProgressMetric>(ep.metrics, {
        method: "POST",
        body: input,
      });
    },

    syncMetrics(input: SyncProgressMetricsInput) {
      return client.request<SyncProgressMetricsResult>(ep.syncMetrics, {
        method: "POST",
        body: input,
      });
    },

    updateMetric(id: string, input: UpdateProgressMetricInput) {
      return client.request<ProgressMetric>(ep.metric(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteMetric(id: string) {
      return client.request<DeleteOk>(ep.metric(id), {
        method: "DELETE",
      });
    },

    listPhotos(query: ListProgressPhotosQuery = {}) {
      return client.request<ProgressPhotosPage>(ep.photos, { query });
    },

    createPhoto(input: CreateProgressPhotoInput) {
      return client.request<ProgressPhoto>(ep.photos, {
        method: "POST",
        body: input,
      });
    },

    updatePhoto(id: string, input: UpdateProgressPhotoInput) {
      return client.request<ProgressPhoto>(ep.photo(id), {
        method: "PATCH",
        body: input,
      });
    },

    deletePhoto(id: string) {
      return client.request<DeleteOk>(ep.photo(id), {
        method: "DELETE",
      });
    },

    listWorkoutLogs(query: ListWorkoutLogsQuery = {}) {
      return client.request<WorkoutLogsPage>(ep.workoutLogs, { query });
    },

    createWorkoutLog(input: CreateWorkoutLogInput) {
      return client.request<WorkoutLog>(ep.workoutLogs, {
        method: "POST",
        body: input,
      });
    },

    listPersonalRecords(query: ListPersonalRecordsQuery = {}) {
      return client.request<PersonalRecordsPage>(ep.personalRecords, {
        query,
      });
    },

    createPersonalRecord(input: CreatePersonalRecordInput) {
      return client.request<PersonalRecord>(ep.personalRecords, {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountProgressApi = ReturnType<typeof createAccountProgressApi>;
