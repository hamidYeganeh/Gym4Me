import {
  createApiClient,
  createArticlesApi,
  createDiscoveryClubsApi,
  createDiscoveryCoachesApi,
} from "@repo/api";
import { getApiBaseUrl } from "./env";

const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
});

export const discoveryClubs = createDiscoveryClubsApi(apiClient);
export const discoveryCoaches = createDiscoveryCoachesApi(apiClient);
export const articlesApi = createArticlesApi(apiClient);

export function mediaFileUrl(mediaId: string | null | undefined): string | null {
  if (!mediaId) return null;
  return `${getApiBaseUrl()}/media/${mediaId}/file`;
}
