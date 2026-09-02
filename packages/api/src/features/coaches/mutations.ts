"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { coachesApi } from "./api";
import { coachKeys } from "./queries";
import type { CoachOfferingInput, CoachPatch } from "./types";
export function useUpdateCoachProfileMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: CoachPatch) => coachesApi.updateMe(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: coachKeys.me }),
  });
}
export function useSubmitCoachProfileMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: () => coachesApi.submit(c),
    onSuccess: async () => q.invalidateQueries({ queryKey: coachKeys.me }),
  });
}
export function useCreateCoachOfferingMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: CoachOfferingInput) => coachesApi.createOffering(c, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: coachKeys.myOfferings }),
  });
}
export function useVerifyCoachMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: "verified" | "rejected" | "needs_correction";
      reason?: string;
    }) => coachesApi.verify(c, id, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["admin", "coaches"] }),
  });
}
export function useRequestCoachingMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      coach_profile_id: string;
      profile?: { goal?: string; sport?: string; note?: string };
    }) => coachesApi.requestRelationship(c, input),
    onSuccess: () => q.invalidateQueries({ queryKey: coachKeys.relationships }),
  });
}
export function useUpdateCoachingStatusMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      status: "active" | "rejected" | "paused" | "ended" | "cancelled";
      reason?: string;
    }) => coachesApi.updateRelationshipStatus(c, id, input),
    onSuccess: () => q.invalidateQueries({ queryKey: coachKeys.relationships }),
  });
}
export function useUpdateCoachingRelationshipMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      coaching: { coach_note?: string; athlete_group?: string; next_review_at?: string };
    }) => coachesApi.updateRelationship(c, id, input),
    onSuccess: () => q.invalidateQueries({ queryKey: coachKeys.relationships }),
  });
}
export function useSendCoachingMessageMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => coachesApi.sendMessage(c, id, text),
    onSuccess: (_, variables) =>
      q.invalidateQueries({ queryKey: coachKeys.messages(variables.id) }),
  });
}
