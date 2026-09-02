import type { ApiClient } from "../../core/client";
import type { ApiEntity, VerificationListParams, VerificationSubmitInput } from "./types";
const e = encodeURIComponent;
async function list(
  c: ApiClient,
  path: string,
  p: VerificationListParams = {},
  signal?: AbortSignal,
) {
  const response = await c.get<ApiEntity[]>(path, {
    query: p as any,
    ...(signal ? { signal } : {}),
  });
  return { items: response.data, pagination: (response.meta as any).pagination };
}
export const verificationsApi = {
  mine: async (c: ApiClient, signal?: AbortSignal) =>
    (await c.get<ApiEntity[]>("/verifications/me", signal ? { signal } : undefined)).data,
  submitCoach: async (c: ApiClient, input: VerificationSubmitInput) =>
    (await c.post<ApiEntity>("/verifications/coach", input)).data,
  organization: (
    c: ApiClient,
    organizationId: string,
    p: VerificationListParams = {},
    signal?: AbortSignal,
  ) => list(c, `/organizations/${e(organizationId)}/verifications`, p, signal),
  submitClub: async (
    c: ApiClient,
    organizationId: string,
    clubId: string,
    input: VerificationSubmitInput,
  ) =>
    (
      await c.post<ApiEntity>(`/organizations/${e(organizationId)}/verifications/clubs`, {
        ...input,
        club_id: clubId,
      })
    ).data,
  admin: (c: ApiClient, p: VerificationListParams = {}, signal?: AbortSignal) =>
    list(c, "/admin/verifications", p, signal),
  review: async (
    c: ApiClient,
    id: string,
    decision: "verified" | "rejected" | "needs_correction",
    note: string,
    documentResults: Array<{
      document_id: string;
      status: "accepted" | "rejected";
      note?: string;
    }> = [],
  ) =>
    (
      await c.post<ApiEntity>(`/admin/verifications/${e(id)}/review`, {
        decision,
        note,
        document_results: documentResults,
      })
    ).data,
};
