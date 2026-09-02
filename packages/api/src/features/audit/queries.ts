"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { auditApi } from "./api";
import type { AuditParams } from "./types";
export const auditKeys = {
  all: ["admin", "audit"] as const,
  list: (params: AuditParams) => [...auditKeys.all, params] as const,
};
export function useAuditLogsQuery(params: AuditParams = {}, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: ({ signal }) => auditApi.list(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
