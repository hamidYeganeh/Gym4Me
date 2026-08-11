import type { ListOwnerTasksQuery } from "./ops.dto";

export const accountOpsKeys = {
  all: ["account", "ops"] as const,
  tasks: (clubId: string, query: ListOwnerTasksQuery = {}) =>
    [...accountOpsKeys.all, "tasks", clubId, query] as const,
  summary: (clubId: string) =>
    [...accountOpsKeys.all, "tasks-summary", clubId] as const,
};
