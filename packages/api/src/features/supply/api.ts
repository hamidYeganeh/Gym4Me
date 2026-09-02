import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type {
  ApiEntity,
  AvailabilityExceptionInput,
  AvailabilityRuleInput,
  CatalogBranchParams,
  CatalogParams,
  OfferingInput,
  OfferingPatch,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
  ResourceInput,
  ResourcePatch,
  SlotSearchParams,
  SlotSearchResult,
} from "./types";
const segment = encodeURIComponent;
async function list<T>(
  client: ApiClient,
  path: string,
  params: object,
  signal?: AbortSignal,
): Promise<PaginatedResult<T>> {
  const query = params as Record<string, unknown>;
  const response = await client.get<T[]>(path, {
    query: query as any,
    ...(signal ? { signal } : {}),
  });
  const pagination = (response.meta as ApiMeta & { pagination?: PaginationMeta }).pagination ?? {
    page: Number(query.page ?? 1),
    limit: Number(query.limit ?? 20),
    total: response.data.length,
    pages: response.data.length ? 1 : 0,
  };
  return { items: response.data, meta: response.meta, pagination };
}
export const supplyApi = {
  catalogBranches: <T = ApiEntity>(
    client: ApiClient,
    params: CatalogBranchParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/catalog/branches", params, signal),
  resources: <T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/branches/${segment(branchId)}/resources`, params, signal),
  catalogResources: <T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    params: CatalogParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/catalog/branches/${segment(branchId)}/resources`, params, signal),
  createResource: async <T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    input: ResourceInput,
  ) =>
    (await client.post<T, ResourceInput>(`/branches/${segment(branchId)}/resources`, input)).data,
  updateResource: async <T = ApiEntity>(
    client: ApiClient,
    resourceId: string,
    input: ResourcePatch,
  ) => (await client.patch<T, ResourcePatch>(`/resources/${segment(resourceId)}`, input)).data,
  offerings: <T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/branches/${segment(branchId)}/offerings`, params, signal),
  catalogOfferings: <T = ApiEntity>(
    client: ApiClient,
    branchId: string,
    params: CatalogParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, `/catalog/branches/${segment(branchId)}/offerings`, params, signal),
  createOffering: async <T = ApiEntity>(
    client: ApiClient,
    organizationId: string,
    input: OfferingInput,
  ) =>
    (
      await client.post<T, OfferingInput>(
        `/organizations/${segment(organizationId)}/offerings`,
        input,
      )
    ).data,
  updateOffering: async <T = ApiEntity>(
    client: ApiClient,
    offeringId: string,
    input: OfferingPatch,
  ) => (await client.patch<T, OfferingPatch>(`/offerings/${segment(offeringId)}`, input)).data,
  rules: async <T = ApiEntity[]>(client: ApiClient, resourceId: string, signal?: AbortSignal) =>
    (
      await client.get<T>(
        `/resources/${segment(resourceId)}/availability/rules`,
        signal ? { signal } : undefined,
      )
    ).data,
  createRule: async <T = ApiEntity>(
    client: ApiClient,
    resourceId: string,
    input: AvailabilityRuleInput,
  ) =>
    (
      await client.post<T, AvailabilityRuleInput>(
        `/resources/${segment(resourceId)}/availability/rules`,
        input,
      )
    ).data,
  createException: async <T = ApiEntity>(
    client: ApiClient,
    resourceId: string,
    input: AvailabilityExceptionInput,
  ) =>
    (
      await client.post<T, AvailabilityExceptionInput>(
        `/resources/${segment(resourceId)}/availability/exceptions`,
        input,
      )
    ).data,
  exceptions: async <T = ApiEntity[]>(
    client: ApiClient,
    resourceId: string,
    signal?: AbortSignal,
  ) =>
    (
      await client.get<T>(
        `/resources/${segment(resourceId)}/availability/exceptions`,
        signal ? { signal } : undefined,
      )
    ).data,
  updateException: async <T = ApiEntity>(
    client: ApiClient,
    exceptionId: string,
    input: Partial<AvailabilityExceptionInput>,
  ) =>
    (
      await client.patch<T, Partial<AvailabilityExceptionInput>>(
        `/availability/exceptions/${segment(exceptionId)}`,
        input,
      )
    ).data,
  archiveException: async <T = ApiEntity>(client: ApiClient, exceptionId: string) =>
    (await client.delete<T>(`/availability/exceptions/${segment(exceptionId)}`)).data,
  slots: async (
    client: ApiClient,
    resourceId: string,
    params: SlotSearchParams,
    isPublic = false,
    signal?: AbortSignal,
  ): Promise<SlotSearchResult> =>
    (
      await client.get<SlotSearchResult>(
        `${isPublic ? "/catalog" : ""}/resources/${segment(resourceId)}/availability/slots`,
        { query: params as any, ...(signal ? { signal } : {}) },
      )
    ).data,
  adminResources: <T = ApiEntity>(
    client: ApiClient,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/admin/catalog/resources", params, signal),
  adminOfferings: <T = ApiEntity>(
    client: ApiClient,
    params: PaginationParams = {},
    signal?: AbortSignal,
  ) => list<T>(client, "/admin/catalog/offerings", params, signal),
  updateAdminStatus: async <T = ApiEntity>(
    client: ApiClient,
    entity: "resources" | "offerings",
    id: string,
    status: string,
  ) => (await client.patch<T>(`/admin/catalog/${entity}/${segment(id)}/status`, { status })).data,
};
