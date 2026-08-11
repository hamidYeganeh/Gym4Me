import type { ApiClient } from "../client";
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
import { accountProgressEndpoints as ep } from "./progress.endpoint";

export function createAccountProgressApi(client: ApiClient) {
  return {
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
      return client.request<unknown>(ep.assignWorkoutProgram(id), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountProgressApi = ReturnType<typeof createAccountProgressApi>;
