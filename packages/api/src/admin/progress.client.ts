import type { ApiClient } from "../client";
import { adminProgressEndpoints as ep } from "./progress.endpoint";
import type {
  AdminExercisesPage,
  AdminMetricTypesPage,
  CreateExerciseInput,
  CreateMetricTypeInput,
  Exercise,
  ListAdminExercisesQuery,
  ListAdminMetricTypesQuery,
  MetricType,
  UpdateExerciseInput,
  UpdateMetricTypeInput,
  VerifyExerciseInput,
} from "./progress.dto";

/** Admin catalogs: exercise library + metric types. */
export function createAdminProgressApi(client: ApiClient) {
  return {
    listExercises(query: ListAdminExercisesQuery = {}) {
      return client.request<AdminExercisesPage>(ep.exercises, { query });
    },

    getExercise(id: string) {
      return client.request<Exercise>(ep.exercise(id));
    },

    createExercise(input: CreateExerciseInput) {
      return client.request<Exercise>(ep.exercises, {
        method: "POST",
        body: input,
      });
    },

    updateExercise(id: string, input: UpdateExerciseInput) {
      return client.request<Exercise>(ep.exercise(id), {
        method: "PATCH",
        body: input,
      });
    },

    verifyExercise(id: string, input: VerifyExerciseInput) {
      return client.request<Exercise>(ep.verifyExercise(id), {
        method: "POST",
        body: input,
      });
    },

    archiveExercise(id: string) {
      return client.request<Exercise>(ep.exercise(id), { method: "DELETE" });
    },

    listMetricTypes(query: ListAdminMetricTypesQuery = {}) {
      return client.request<AdminMetricTypesPage>(ep.metricTypes, { query });
    },

    getMetricType(id: string) {
      return client.request<MetricType>(ep.metricType(id));
    },

    createMetricType(input: CreateMetricTypeInput) {
      return client.request<MetricType>(ep.metricTypes, {
        method: "POST",
        body: input,
      });
    },

    updateMetricType(id: string, input: UpdateMetricTypeInput) {
      return client.request<MetricType>(ep.metricType(id), {
        method: "PATCH",
        body: input,
      });
    },

    archiveMetricType(id: string) {
      return client.request<MetricType>(ep.metricType(id), {
        method: "DELETE",
      });
    },
  };
}

export type AdminProgressApi = ReturnType<typeof createAdminProgressApi>;
