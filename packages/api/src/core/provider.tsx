"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiClient, createApiClient } from "./client";
import { createApiQueryClient } from "./query-client";

const ApiClientContext = createContext<ApiClient | null>(null);

export interface ApiProviderProps {
  accessToken?: string | null;
  baseUrl?: string;
  children: ReactNode;
  client?: ApiClient;
  queryClient?: QueryClient;
}

export function ApiProvider({
  accessToken,
  baseUrl,
  children,
  client,
  queryClient,
}: ApiProviderProps) {
  const apiClient = useMemo(() => {
    if (client) return client;
    if (!baseUrl) throw new Error("ApiProvider requires either a client or a baseUrl.");
    return createApiClient({ baseUrl, ...(accessToken === undefined ? {} : { accessToken }) });
  }, [baseUrl, client]);
  const [ownedQueryClient] = useState(createApiQueryClient);

  useEffect(() => {
    if (accessToken !== undefined) apiClient.setAccessToken(accessToken);
  }, [accessToken, apiClient]);

  return (
    <ApiClientContext.Provider value={apiClient}>
      <QueryClientProvider client={queryClient ?? ownedQueryClient}>{children}</QueryClientProvider>
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error("useApiClient must be used inside ApiProvider.");
  return client;
}
