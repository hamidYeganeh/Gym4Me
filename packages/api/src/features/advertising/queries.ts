"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { advertisingApi } from "./api";
import type { AdListParams } from "./types";
export const advertisingKeys = {
  all: ["advertising"] as const,
  placements: (managed: boolean) => ["advertising", "placements", managed] as const,
  organization: (id: string, p: unknown) => ["advertising", "organization", id, p] as const,
  admin: (p: unknown) => ["advertising", "admin", p] as const,
  render: (code: string, q: unknown) => ["advertising", "render", code, q] as const,
};
export function useAdPlacementsQuery(managed = false) {
  const c = useApiClient();
  return useQuery({
    queryKey: advertisingKeys.placements(managed),
    queryFn: ({ signal }) => advertisingApi.placements(c, managed, signal),
  });
}
export function useOrganizationCampaignsQuery(id: string, p: AdListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: advertisingKeys.organization(id, p),
    queryFn: ({ signal }) => advertisingApi.organizationCampaigns(c, id, p, signal),
    enabled: Boolean(id),
  });
}
export function useAdminCampaignsQuery(p: AdListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: advertisingKeys.admin(p),
    queryFn: ({ signal }) => advertisingApi.adminCampaigns(c, p, signal),
  });
}
export function useRenderedAdQuery(
  code: string,
  query: {
    city?: string;
    sport_id?: string;
    branch_id?: string;
    audience_role?: "athlete" | "coach";
  } = {},
) {
  const c = useApiClient();
  return useQuery({
    queryKey: advertisingKeys.render(code, query),
    queryFn: ({ signal }) => advertisingApi.render(c, code, query, signal),
    enabled: Boolean(code),
    staleTime: 60_000,
  });
}
