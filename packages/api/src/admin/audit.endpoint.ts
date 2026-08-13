export const adminAuditEndpoints = {
  list: "/admin/audit-logs",
  startImpersonation: "/admin/impersonation",
  endImpersonation: (sessionId: string) =>
    `/admin/impersonation/${sessionId}/end`,
} as const;
