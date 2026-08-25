import { createApiClient } from "@repo/api/client";
import { createArticlesApi } from "@repo/api/articles";
import {
  createDiscoveryClassesApi,
  createDiscoveryClubSlotsApi,
  createDiscoveryClubsApi,
  createDiscoveryCoachesApi,
} from "@repo/api/discovery";
import { createBasicsLocationsApi } from "@repo/api/basics";
import { createAccountMembershipsApi } from "@repo/api/memberships";
import { getApiBaseUrl } from "./env";

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
});

export const discoveryClubs = createDiscoveryClubsApi(apiClient);
export const discoveryClasses = createDiscoveryClassesApi(apiClient);
export const discoveryClubSlots = createDiscoveryClubSlotsApi(apiClient);
export const discoveryCoaches = createDiscoveryCoachesApi(apiClient);
export const basicsLocations = createBasicsLocationsApi(apiClient);
export const articlesApi = createArticlesApi(apiClient);
export const membershipsApi = createAccountMembershipsApi(apiClient);

export function mediaFileUrl(
  mediaId: string | null | undefined,
): string | null {
  if (!mediaId) return null;
  return `${getApiBaseUrl()}/media/${mediaId}/file`;
}
