import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type { AuditList, AuditLog, AuditParams } from "./types";
export const auditApi = {
  async list(
    client: ApiClient,
    params: AuditParams = {},
    signal?: AbortSignal,
  ): Promise<AuditList> {
    const response = await client.get<AuditLog[]>("/admin/audit-logs", {
      query: params as any,
      ...(signal ? { signal } : {}),
    });
    const pagination = (response.meta as ApiMeta & { pagination?: AuditList["pagination"] })
      .pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 30,
      total: response.data.length,
      pages: response.data.length ? 1 : 0,
    };
    return { items: response.data, meta: response.meta, pagination };
  },
};
