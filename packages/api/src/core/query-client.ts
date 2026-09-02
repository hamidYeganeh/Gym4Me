import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { ApiError } from "./error";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (!(error instanceof ApiError)) return true;
  if (error.status === 0 || error.status === 408 || error.status === 429) return true;
  return error.status >= 500;
}

export function createApiQueryClient(config: QueryClientConfig = {}): QueryClient {
  const { defaultOptions, ...rest } = config;

  return new QueryClient({
    ...rest,
    defaultOptions: {
      ...defaultOptions,
      queries: {
        staleTime: 5 * 60 * 1_000,
        gcTime: 30 * 60 * 1_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        ...defaultOptions?.queries,
      },
      mutations: {
        retry: false,
        ...defaultOptions?.mutations,
      },
    },
  });
}
