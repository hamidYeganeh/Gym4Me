import type { ApiClient } from "../../core/client";
import type { HealthStatus } from "./types";

export async function getHealth(client: ApiClient, signal?: AbortSignal): Promise<HealthStatus> {
  const response = await client.get<HealthStatus>("/health", signal ? { signal } : undefined);
  return response.data;
}

export const healthApi = {
  get: getHealth,
};
