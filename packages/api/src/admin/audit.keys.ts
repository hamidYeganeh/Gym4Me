import type { ListAuditLogsQuery } from "./audit.dto";

export const adminAuditKeys = {
  all: ["admin", "audit"] as const,
  list: (query: ListAuditLogsQuery = {}) =>
    [...adminAuditKeys.all, "list", query] as const,
};
