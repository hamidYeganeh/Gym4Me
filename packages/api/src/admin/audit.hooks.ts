import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import { createAdminAuditApi, type AdminAuditApi } from "./audit.client";
import type {
  AuditLogsPage,
  ImpersonationSession,
  ListAuditLogsQuery,
  StartImpersonationInput,
  StartImpersonationResult,
} from "./audit.dto";
import { adminAuditKeys } from "./audit.keys";

function useAdminAuditApi(): AdminAuditApi {
  const client = useApiClient();
  return useMemo(() => createAdminAuditApi(client), [client]);
}

export function useAdminAuditLogs(
  query: ListAuditLogsQuery = {},
  options?: Omit<
    UseQueryOptions<AuditLogsPage, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminAuditApi();
  return useQuery({
    queryKey: adminAuditKeys.list(query),
    queryFn: () => api.list(query),
    ...options,
  });
}

export function useStartImpersonation(
  options?: UseMutationOptions<
    StartImpersonationResult,
    Error,
    StartImpersonationInput
  >,
) {
  const api = useAdminAuditApi();
  return useMutation({
    ...(options ?? {}),
    mutationFn: (input) => api.startImpersonation(input),
  });
}

export function useEndImpersonation(
  options?: UseMutationOptions<ImpersonationSession, Error, string>,
) {
  const api = useAdminAuditApi();
  return useMutation({
    ...(options ?? {}),
    mutationFn: (sessionId) => api.endImpersonation(sessionId),
  });
}
