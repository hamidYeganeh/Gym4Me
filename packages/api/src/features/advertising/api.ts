import type { ApiClient } from "../../core/client";
import type {
  AdCampaignInput,
  AdListParams,
  AdPlacementInput,
  ApiEntity,
  RenderedAd,
} from "./types";
const e = encodeURIComponent;
async function list(c: ApiClient, path: string, p: AdListParams = {}, signal?: AbortSignal) {
  const response = await c.get<ApiEntity[]>(path, {
    query: p as any,
    ...(signal ? { signal } : {}),
  });
  return {
    items: response.data,
    meta: response.meta,
    pagination: (response.meta as any).pagination,
  };
}
export const advertisingApi = {
  placements: async (c: ApiClient, managed = false, signal?: AbortSignal) =>
    (
      await c.get<ApiEntity[]>(
        managed ? "/admin/advertising/placements" : "/catalog/advertising/placements",
        signal ? { signal } : undefined,
      )
    ).data,
  organizationCampaigns: (
    c: ApiClient,
    organizationId: string,
    p: AdListParams = {},
    signal?: AbortSignal,
  ) => list(c, `/organizations/${e(organizationId)}/advertising/campaigns`, p, signal),
  adminCampaigns: (c: ApiClient, p: AdListParams = {}, signal?: AbortSignal) =>
    list(c, "/admin/advertising/campaigns", p, signal),
  createCampaign: async (c: ApiClient, organizationId: string, input: AdCampaignInput) =>
    (await c.post<ApiEntity>(`/organizations/${e(organizationId)}/advertising/campaigns`, input))
      .data,
  updateCampaign: async (
    c: ApiClient,
    organizationId: string,
    id: string,
    input: Partial<AdCampaignInput>,
  ) =>
    (
      await c.patch<ApiEntity>(
        `/organizations/${e(organizationId)}/advertising/campaigns/${e(id)}`,
        input,
      )
    ).data,
  action: async (
    c: ApiClient,
    organizationId: string,
    id: string,
    action: "submit" | "pause" | "resume" | "archive",
  ) =>
    (
      await c.post<ApiEntity>(
        `/organizations/${e(organizationId)}/advertising/campaigns/${e(id)}/actions`,
        { action },
      )
    ).data,
  review: async (c: ApiClient, id: string, decision: "approve" | "reject", note: string) =>
    (await c.post<ApiEntity>(`/admin/advertising/campaigns/${e(id)}/review`, { decision, note }))
      .data,
  upsertPlacement: async (c: ApiClient, input: AdPlacementInput) =>
    (await c.put<ApiEntity>(`/admin/advertising/placements/${e(input.code)}`, input)).data,
  render: async (
    c: ApiClient,
    code: string,
    query: {
      city?: string;
      sport_id?: string;
      branch_id?: string;
      audience_role?: "athlete" | "coach";
    } = {},
    signal?: AbortSignal,
  ) =>
    (
      await c.get<RenderedAd | null>(`/catalog/advertising/placements/${e(code)}/render`, {
        query,
        ...(signal ? { signal } : {}),
      })
    ).data,
  event: async (
    c: ApiClient,
    campaignId: string,
    input: {
      tracking_token: string;
      type: "impression" | "click" | "conversion";
      context: ApiEntity;
    },
  ) =>
    (
      await c.post<{ accepted: boolean; duplicate: boolean }>(
        `/catalog/advertising/campaigns/${e(campaignId)}/events`,
        input,
      )
    ).data,
};
