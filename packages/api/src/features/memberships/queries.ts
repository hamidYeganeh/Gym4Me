"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { membershipsApi } from "./api";
import type {
  AdminMembershipListParams,
  AdminMembershipResource,
  MembershipListParams,
} from "./types";
export const membershipKeys = {
  all: ["memberships"] as const,
  catalog: (o: string, p: unknown) => ["memberships", "catalog", o, p] as const,
  managed: (o: string, p: unknown) => ["memberships", "managed", o, p] as const,
  contracts: (o: string, p: unknown) => ["memberships", "contracts", o, p] as const,
  mine: ["memberships", "me"] as const,
  eligible: (offeringId: string, branchId: string) =>
    ["memberships", "eligible", offeringId, branchId] as const,
  corporateAccounts: (o: string, p: unknown) =>
    ["memberships", "corporate-accounts", o, p] as const,
  corporateMembers: (o: string, a: string, p: unknown) =>
    ["memberships", "corporate-members", o, a, p] as const,
  corporateContracts: (o: string, p: unknown) =>
    ["memberships", "corporate-contracts", o, p] as const,
  admin: (r: string, p: unknown) => ["admin", "memberships", r, p] as const,
  corporateEnrollments: (o: string, c: string, p: unknown) =>
    ["memberships", "corporate-enrollments", o, c, p] as const,
};
export function useMembershipCatalogQuery(o: string, p: MembershipListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.catalog(o, p),
    queryFn: ({ signal }) => membershipsApi.catalog(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useCorporateAccountsQuery(o: string, p: MembershipListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.corporateAccounts(o, p),
    queryFn: ({ signal }) => membershipsApi.corporateAccounts(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useCorporateMembersQuery(
  o: string,
  accountId: string,
  p: MembershipListParams = {},
) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.corporateMembers(o, accountId, p),
    queryFn: ({ signal }) => membershipsApi.corporateMembers(c, o, accountId, p, signal),
    enabled: Boolean(o && accountId),
  });
}
export function useCorporateContractsQuery(o: string, p: MembershipListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.corporateContracts(o, p),
    queryFn: ({ signal }) => membershipsApi.corporateContracts(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useManagedMembershipsQuery(o: string, p: MembershipListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.managed(o, p),
    queryFn: ({ signal }) => membershipsApi.managed(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useManagedMembershipContractsQuery(o: string, p: MembershipListParams = {}) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.contracts(o, p),
    queryFn: ({ signal }) => membershipsApi.contracts(c, o, p, signal),
    enabled: Boolean(o),
  });
}
export function useMyMembershipsQuery() {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.mine,
    queryFn: ({ signal }) => membershipsApi.mine(c, signal),
  });
}
export function useEligibleMembershipsQuery(
  offeringId: string,
  branchId: string,
  options: { enabled?: boolean } = {},
) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.eligible(offeringId, branchId),
    queryFn: ({ signal }) => membershipsApi.eligible(c, offeringId, branchId, signal),
    enabled: options.enabled !== false && Boolean(offeringId && branchId),
  });
}
export function useAdminMembershipsQuery(
  resource: AdminMembershipResource,
  p: AdminMembershipListParams = {},
) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.admin(resource, p),
    queryFn: ({ signal }) => membershipsApi.adminList(c, resource, p, signal),
  });
}
export function useCorporateEnrollmentsQuery(
  o: string,
  contractId: string,
  p: MembershipListParams = {},
) {
  const c = useApiClient();
  return useQuery({
    queryKey: membershipKeys.corporateEnrollments(o, contractId, p),
    queryFn: ({ signal }) => membershipsApi.corporateEnrollments(c, o, contractId, p, signal),
    enabled: Boolean(o && contractId),
  });
}
