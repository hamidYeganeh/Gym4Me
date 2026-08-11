export const accountOpsEndpoints = {
  tasks: (clubId: string) => `/account/clubs/${clubId}/tasks`,
  tasksSummary: (clubId: string) => `/account/clubs/${clubId}/tasks/summary`,
  taskStatus: (clubId: string, taskId: string) =>
    `/account/clubs/${clubId}/tasks/${taskId}/status`,
} as const;
