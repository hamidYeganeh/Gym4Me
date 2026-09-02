"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { reviewsApi } from "./api";
import type { ReviewInput } from "./types";
export function useCreateReviewMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewInput) => reviewsApi.create(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
export function useReplyReviewMutation(organizationId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      reviewsApi.reply(c, organizationId, id, body),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["reviews", "organization", organizationId] }),
  });
}
export function useModerateReviewMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
    }: {
      id: string;
      decision: "approve" | "reject" | "hide" | "restore";
      note: string;
    }) => reviewsApi.moderate(c, id, decision, note),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["reviews", "admin"] }),
  });
}
export function useReportReviewMutation() {
  const c = useApiClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      note,
    }: {
      id: string;
      reason: "spam" | "abuse" | "privacy" | "false_information" | "other";
      note?: string;
    }) => reviewsApi.report(c, id, reason, note),
  });
}
