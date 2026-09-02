"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { verificationsApi } from "./api";
import type { VerificationSubmitInput } from "./types";
export function useSubmitCoachVerificationMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: VerificationSubmitInput) => verificationsApi.submitCoach(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["verifications"] }),
  });
}
export function useSubmitClubVerificationMutation(organizationId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, input }: { clubId: string; input: VerificationSubmitInput }) =>
      verificationsApi.submitClub(c, organizationId, clubId, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["verifications", "organization", organizationId] }),
  });
}
export function useReviewVerificationMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      note,
      documentResults = [],
    }: {
      id: string;
      decision: "verified" | "rejected" | "needs_correction";
      note: string;
      documentResults?: Array<{
        document_id: string;
        status: "accepted" | "rejected";
        note?: string;
      }>;
    }) => verificationsApi.review(c, id, decision, note, documentResults),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["verifications", "admin"] }),
  });
}
