import type { ApiClient } from "../../core/client";
import type { ApiEntity, ReviewInput, ReviewListParams, ReviewListResult } from "./types";
const e = encodeURIComponent;
async function list(
  c: ApiClient,
  path: string,
  p: ReviewListParams = {},
  signal?: AbortSignal,
): Promise<ReviewListResult> {
  const response = await c.get<ApiEntity[]>(path, {
    query: p as any,
    ...(signal ? { signal } : {}),
  });
  return {
    items: response.data,
    pagination: (response.meta as any).pagination,
    ...((response as any).summary ? { summary: (response as any).summary } : {}),
  };
}
export const reviewsApi = {
  catalog: (c: ApiClient, p: ReviewListParams, signal?: AbortSignal) =>
    list(c, "/catalog/reviews", p, signal),
  mine: async (c: ApiClient, signal?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/reviews/me", signal ? { signal } : undefined)).data,
  create: async (c: ApiClient, input: ReviewInput) =>
    (await c.post<ApiEntity>("/reviews", input)).data,
  update: async (c: ApiClient, id: string, input: Pick<ReviewInput, "rating" | "content">) =>
    (await c.patch<ApiEntity>(`/reviews/${e(id)}`, input)).data,
  report: async (
    c: ApiClient,
    id: string,
    reason: "spam" | "abuse" | "privacy" | "false_information" | "other",
    note?: string,
  ) => (await c.post<ApiEntity>(`/reviews/${e(id)}/reports`, { reason, note })).data,
  organization: (
    c: ApiClient,
    organizationId: string,
    p: ReviewListParams = {},
    signal?: AbortSignal,
  ) => list(c, `/organizations/${e(organizationId)}/reviews`, p, signal),
  reply: async (c: ApiClient, organizationId: string, id: string, body: string) =>
    (
      await c.post<ApiEntity>(`/organizations/${e(organizationId)}/reviews/${e(id)}/reply`, {
        body,
      })
    ).data,
  admin: (c: ApiClient, p: ReviewListParams = {}, signal?: AbortSignal) =>
    list(c, "/admin/reviews", p, signal),
  moderate: async (
    c: ApiClient,
    id: string,
    decision: "approve" | "reject" | "hide" | "restore",
    note: string,
  ) => (await c.post<ApiEntity>(`/admin/reviews/${e(id)}/moderation`, { decision, note })).data,
};
