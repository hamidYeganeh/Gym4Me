"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ApiClient } from "../../core/client";
import { useApiClient } from "../../core/provider";
import { getHealth } from "./api";

export const healthKeys = {
  all: ["health"] as const,
};

export function healthQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: healthKeys.all,
    queryFn: ({ signal }) => getHealth(client, signal),
  });
}

export function useHealthQuery() {
  return useQuery(healthQueryOptions(useApiClient()));
}
