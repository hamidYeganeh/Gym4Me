import { createApiClient } from "@repo/api/client";
import { createArticlesApi } from "@repo/api/articles";
import {
  createDiscoveryClassesApi,
  createDiscoveryClubsApi,
  createDiscoveryCoachesApi,
} from "@repo/api/discovery";
import { createAccountMembershipsApi } from "@repo/api/memberships";
import { getApiBaseUrl } from "./env";

const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
});

export const discoveryClubs = createDiscoveryClubsApi(apiClient);
export const discoveryClasses = createDiscoveryClassesApi(apiClient);
export const discoveryCoaches = createDiscoveryCoachesApi(apiClient);
export const articlesApi = createArticlesApi(apiClient);
export const membershipsApi = createAccountMembershipsApi(apiClient);

export function mediaFileUrl(
  mediaId: string | null | undefined,
): string | null {
  if (!mediaId) return null;
  return `${getApiBaseUrl()}/media/${mediaId}/file`;
}
