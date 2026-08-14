import type { ApiClient } from "../client";
import type {
  AssignWorkoutProgramInput,
  AthleteDataGrant,
  AthleteDataGrantsPage,
  CreateAthleteDataGrantInput,
  CreateExerciseInput,
  CreateMetricGoalInput,
  CreatePersonalRecordInput,
  CreateProgressMetricInput,
  CreateProgressPhotoInput,
  CreateWorkoutLogInput,
  CreateWorkoutPlanInput,
  CreateWorkoutProgramInput,
  ConsentHistoryResult,
  DeleteOk,
  DeleteProgressMetricsInput,
  DeleteProgressMetricsResult,
  Exercise,
  ExercisesPage,
  HealthSyncProvider,
  HealthSyncStatesResult,
  ListAthleteDataGrantsQuery,
  ListExercisesQuery,
  ListHealthSyncStatesQuery,
  ListMetricGoalsQuery,
  ListMetricRemindersQuery,
  ListMetricTypesQuery,
  ListPersonalRecordsQuery,
  ListProgressMetricsQuery,
  ListProgressPhotosQuery,
  ListWorkoutLogsQuery,
  ListWorkoutPlansQuery,
  ListWorkoutProgramsQuery,
  MetricGoal,
  MetricGoalsPage,
  MetricReminder,
  MetricRemindersPage,
  MetricsSummaryQuery,
  MetricsSummaryResult,
  MetricTypesPage,
  PersonalRecord,
  PersonalRecordsPage,
  ProgressExportPayload,
  ProgressMetric,
  ProgressMetricsPage,
  ProgressPhoto,
  ProgressPhotosPage,
  SyncProgressMetricsInput,
  SyncProgressMetricsResult,
  UpdateMetricGoalInput,
  UpdateProgressMetricInput,
  UpdateProgressPhotoInput,
  UpdateWorkoutLogInput,
  UpdateWorkoutPlanInput,
  UpdateWorkoutProgramInput,
  UpsertHealthSyncStateInput,
  UpsertMetricReminderInput,
  WorkoutLog,
  WorkoutLogsPage,
  WorkoutPlan,
  WorkoutPlansPage,
  WorkoutProgram,
  WorkoutProgramsPage,
  HealthSyncState,
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

    metricsSummary(query: MetricsSummaryQuery = {}) {
      return client.request<MetricsSummaryResult>(ep.metricsSummary, {
        query,
      });
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

    updateWorkoutLog(id: string, input: UpdateWorkoutLogInput) {
      return client.request<WorkoutLog>(ep.workoutLog(id), {
        method: "PATCH",
        body: input,
      });
    },

    completeWorkoutLog(id: string) {
      return client.request<WorkoutLog>(ep.completeWorkoutLog(id), {
        method: "POST",
      });
    },

    listGoals(query: ListMetricGoalsQuery = {}) {
      return client.request<MetricGoalsPage>(ep.goals, { query });
    },

    createGoal(input: CreateMetricGoalInput) {
      return client.request<MetricGoal>(ep.goals, {
        method: "POST",
        body: input,
      });
    },

    updateGoal(id: string, input: UpdateMetricGoalInput) {
      return client.request<MetricGoal>(ep.goal(id), {
        method: "PATCH",
        body: input,
      });
    },

    listReminders(query: ListMetricRemindersQuery = {}) {
      return client.request<MetricRemindersPage>(ep.reminders, { query });
    },

    upsertReminder(metricKey: string, input: UpsertMetricReminderInput) {
      return client.request<MetricReminder>(ep.reminder(metricKey), {
        method: "PUT",
        body: input,
      });
    },

    listHealthSyncStates(query: ListHealthSyncStatesQuery = {}) {
      return client.request<HealthSyncStatesResult>(ep.healthSync, { query });
    },

    upsertHealthSyncState(
      provider: HealthSyncProvider,
      input: UpsertHealthSyncStateInput,
    ) {
      return client.request<HealthSyncState>(ep.healthSyncProvider(provider), {
        method: "PUT",
        body: input,
      });
    },

    exportProgress() {
      return client.request<ProgressExportPayload>(ep.export);
    },

    deleteMetrics(input: DeleteProgressMetricsInput) {
      return client.request<DeleteProgressMetricsResult>(ep.deleteMetrics, {
        method: "DELETE",
        body: input,
      });
    },

    deleteMetricsDataRights(input: DeleteProgressMetricsInput) {
      return client.request<DeleteProgressMetricsResult>(
        ep.deleteMetricsDataRights,
        {
          method: "POST",
          body: input,
        },
      );
    },

    consentHistory() {
      return client.request<ConsentHistoryResult>(ep.consentHistory);
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

    listDataGrants(query: ListAthleteDataGrantsQuery = {}) {
      return client.request<AthleteDataGrantsPage>(ep.dataGrants, { query });
    },

    createDataGrant(input: CreateAthleteDataGrantInput) {
      return client.request<AthleteDataGrant>(ep.dataGrants, {
        method: "POST",
        body: input,
      });
    },

    revokeDataGrant(id: string) {
      return client.request<AthleteDataGrant>(ep.revokeDataGrant(id), {
        method: "POST",
      });
    },
  };
}

export type AccountProgressApi = ReturnType<typeof createAccountProgressApi>;
