"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ApiClient } from "../../core/client";
import { useApiClient } from "../../core/provider";
import { accountApi } from "./api";

export const accountKeys = {
  all: ["account"] as const,
  profile: () => [...accountKeys.all, "profile"] as const,
  accessContext: () => [...accountKeys.all, "access-context"] as const,
  sessions: () => [...accountKeys.all, "sessions"] as const,
};

export function profileQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: accountKeys.profile(),
    queryFn: ({ signal }) => accountApi.getProfile(client, signal),
  });
}

export function accessContextQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: accountKeys.accessContext(),
    queryFn: ({ signal }) => accountApi.getAccessContext(client, signal),
  });
}

export function useProfileQuery(options: { enabled?: boolean } = {}) {
  return useQuery({ ...profileQueryOptions(useApiClient()), ...options });
}

export function useAccessContextQuery(options: { enabled?: boolean } = {}) {
  return useQuery({ ...accessContextQueryOptions(useApiClient()), ...options });
}

export function useSessionsQuery(options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: accountKeys.sessions(),
    queryFn: ({ signal }) => accountApi.sessions(client, signal),
    enabled: options.enabled ?? true,
  });
}
