"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { advertisingApi } from "./api";
import type { AdCampaignInput, AdPlacementInput, ApiEntity } from "./types";
export function useCreateAdCampaignMutation(organizationId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: AdCampaignInput) => advertisingApi.createCampaign(c, organizationId, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["advertising", "organization", organizationId] }),
  });
}
export function useAdCampaignActionMutation(organizationId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "submit" | "pause" | "resume" | "archive";
    }) => advertisingApi.action(c, organizationId, id, action),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["advertising", "organization", organizationId] }),
  });
}
export function useReviewAdCampaignMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approve" | "reject";
      note: string;
    }) => advertisingApi.review(c, id, decision, note),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["advertising", "admin"] }),
  });
}
export function useUpsertAdPlacementMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: AdPlacementInput) => advertisingApi.upsertPlacement(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["advertising", "placements"] }),
  });
}
export function useAdMetricMutation() {
  const c = useApiClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      ...input
    }: {
      campaignId: string;
      tracking_token: string;
      type: "impression" | "click" | "conversion";
      context: ApiEntity;
    }) => advertisingApi.event(c, campaignId, input),
  });
}
