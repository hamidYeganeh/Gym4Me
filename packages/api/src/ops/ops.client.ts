import type { ApiClient } from "../client";
import type {
  CreateOwnerTaskInput,
  ListOwnerTasksQuery,
  OwnerTask,
  OwnerTasksPage,
  OwnerTasksSummary,
  UpdateOwnerTaskStatusInput,
} from "./ops.dto";
import { accountOpsEndpoints as ep } from "./ops.endpoint";

export function createAccountOpsApi(client: ApiClient) {
  return {
    listTasks(clubId: string, query: ListOwnerTasksQuery = {}) {
      return client.request<OwnerTasksPage>(ep.tasks(clubId), { query });
    },

    tasksSummary(clubId: string) {
      return client.request<OwnerTasksSummary>(ep.tasksSummary(clubId));
    },

    createTask(clubId: string, input: CreateOwnerTaskInput) {
      return client.request<OwnerTask>(ep.tasks(clubId), {
        method: "POST",
        body: input,
      });
    },

    updateTaskStatus(
      clubId: string,
      taskId: string,
      input: UpdateOwnerTaskStatusInput,
    ) {
      return client.request<OwnerTask>(ep.taskStatus(clubId, taskId), {
        method: "PATCH",
        body: input,
      });
    },
  };
}

export type AccountOpsApi = ReturnType<typeof createAccountOpsApi>;
