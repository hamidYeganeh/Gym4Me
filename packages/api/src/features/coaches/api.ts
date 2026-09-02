import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type { ApiEntity, CoachOfferingInput, CoachPatch, CoachSearchParams } from "./types";
const segment = encodeURIComponent;
async function list(
  client: ApiClient,
  path: string,
  params: CoachSearchParams,
  signal?: AbortSignal,
) {
  const response = await client.get<ApiEntity[]>(path, {
    query: params as any,
    ...(signal ? { signal } : {}),
  });
  return {
    items: response.data,
    meta: response.meta,
    pagination: (response.meta as ApiMeta & { pagination?: any }).pagination ?? {
      page: 1,
      limit: 20,
      total: response.data.length,
      pages: response.data.length ? 1 : 0,
    },
  };
}
export const coachesApi = {
  list: (c: ApiClient, p: CoachSearchParams = {}, s?: AbortSignal) =>
    list(c, "/catalog/coaches", p, s),
  detail: async (c: ApiClient, id: string, s?: AbortSignal) =>
    (await c.get<ApiEntity>(`/catalog/coaches/${segment(id)}`, s ? { signal: s } : undefined)).data,
  me: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity | null>("/coaches/me", s ? { signal: s } : undefined)).data,
  updateMe: async (c: ApiClient, input: CoachPatch) =>
    (await c.patch<ApiEntity, CoachPatch>("/coaches/me", input)).data,
  submit: async (c: ApiClient) => (await c.post<ApiEntity>("/coaches/me/submit")).data,
  myOfferings: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/coaches/me/offerings", s ? { signal: s } : undefined)).data,
  mySettlements: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/coaches/me/settlements", s ? { signal: s } : undefined)).data,
  createOffering: async (c: ApiClient, input: CoachOfferingInput) =>
    (await c.post<ApiEntity>("/coaches/me/offerings", input)).data,
  relationships: async (c: ApiClient, s?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/coaching/me", s ? { signal: s } : undefined)).data,
  requestRelationship: async (
    c: ApiClient,
    input: { coach_profile_id: string; profile?: { goal?: string; sport?: string; note?: string } },
  ) => (await c.post<ApiEntity>("/coaching/relationships", input)).data,
  updateRelationshipStatus: async (
    c: ApiClient,
    id: string,
    input: { status: "active" | "rejected" | "paused" | "ended" | "cancelled"; reason?: string },
  ) => (await c.patch<ApiEntity>(`/coaching/relationships/${segment(id)}/status`, input)).data,
  updateRelationship: async (
    c: ApiClient,
    id: string,
    input: { coaching: { coach_note?: string; athlete_group?: string; next_review_at?: string } },
  ) => (await c.patch<ApiEntity>(`/coaching/relationships/${segment(id)}`, input)).data,
  messages: async (c: ApiClient, id: string, s?: AbortSignal) =>
    (
      await c.get<ApiEntity[]>(
        `/coaching/relationships/${segment(id)}/messages`,
        s ? { signal: s } : undefined,
      )
    ).data,
  sendMessage: async (c: ApiClient, id: string, text: string) =>
    (await c.post<ApiEntity>(`/coaching/relationships/${segment(id)}/messages`, { text })).data,
  adminList: (c: ApiClient, p: CoachSearchParams = {}, s?: AbortSignal) =>
    list(c, "/admin/coaches", p, s),
  verify: async (
    c: ApiClient,
    id: string,
    input: { status: "verified" | "rejected" | "needs_correction"; reason?: string },
  ) => (await c.patch<ApiEntity>(`/admin/coaches/${segment(id)}/verification`, input)).data,
};
