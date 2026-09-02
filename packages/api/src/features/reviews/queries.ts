"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { reviewsApi } from "./api";
import type { ReviewListParams } from "./types";
export const reviewKeys = {
  all: ["reviews"] as const,
  catalog: (p: unknown) => ["reviews", "catalog", p] as const,
  mine: ["reviews", "me"] as const,
  organization: (id: string, p: unknown) => ["reviews", "organization", id, p] as const,
  admin: (p: unknown) => ["reviews", "admin", p] as const,
};
export function useReviewsQuery(p: ReviewListParams, options: { enabled?: boolean } = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: reviewKeys.catalog(p),
    queryFn: ({ signal }) => reviewsApi.catalog(c, p, signal),
    enabled: options.enabled !== false && Boolean(p.subject_id && p.subject_type),
  });
}
export function useMyReviewsQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: reviewKeys.mine,
    queryFn: ({ signal }) => reviewsApi.mine(c, signal),
  });
}
export function useOrganizationReviewsQuery(id: string, p: ReviewListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: reviewKeys.organization(id, p),
    queryFn: ({ signal }) => reviewsApi.organization(c, id, p, signal),
    enabled: Boolean(id),
  });
}
export function useAdminReviewsQuery(p: ReviewListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: reviewKeys.admin(p),
    queryFn: ({ signal }) => reviewsApi.admin(c, p, signal),
  });
}
