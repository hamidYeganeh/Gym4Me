"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { verificationsApi } from "./api";
import type { VerificationListParams } from "./types";
export const verificationKeys = {
  all: ["verifications"] as const,
  mine: ["verifications", "me"] as const,
  organization: (id: string, p: unknown) => ["verifications", "organization", id, p] as const,
  admin: (p: unknown) => ["verifications", "admin", p] as const,
};
export function useMyVerificationsQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: verificationKeys.mine,
    queryFn: ({ signal }) => verificationsApi.mine(c, signal),
  });
}
export function useOrganizationVerificationsQuery(id: string, p: VerificationListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: verificationKeys.organization(id, p),
    queryFn: ({ signal }) => verificationsApi.organization(c, id, p, signal),
    enabled: Boolean(id),
  });
}
export function useAdminVerificationsQuery(p: VerificationListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: verificationKeys.admin(p),
    queryFn: ({ signal }) => verificationsApi.admin(c, p, signal),
  });
}
