import type { ApiClient } from "../client";
import type {
  AuditLogsPage,
  ImpersonationSession,
  ListAuditLogsQuery,
  StartImpersonationInput,
  StartImpersonationResult,
} from "./audit.dto";
import { adminAuditEndpoints as ep } from "./audit.endpoint";

export function createAdminAuditApi(client: ApiClient) {
  return {
    list(query: ListAuditLogsQuery = {}) {
      return client.request<AuditLogsPage>(ep.list, { query });
    },
    startImpersonation(input: StartImpersonationInput) {
      return client.request<StartImpersonationResult>(ep.startImpersonation, {
        method: "POST",
        body: input,
      });
    },
    endImpersonation(sessionId: string) {
      return client.request<ImpersonationSession>(
        ep.endImpersonation(sessionId),
        { method: "POST" },
      );
    },
  };
}

export type AdminAuditApi = ReturnType<typeof createAdminAuditApi>;
