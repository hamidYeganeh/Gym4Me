"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { membershipsApi } from "./api";
import { membershipKeys } from "./queries";
import type {
  CorporateAccountInput,
  CorporateAccountPatch,
  CorporateContractInput,
  CorporateContractPatch,
  CorporateMemberInput,
  CorporateMemberPatch,
  MembershipProductInput,
  AdminMembershipResource,
} from "./types";
export function useCreateMembershipProductMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: MembershipProductInput) => membershipsApi.create(c, org, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["memberships", "managed", org] }),
  });
}
export function usePurchaseMembershipMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      price_id: string;
      beneficiaries: Array<{ user_id: string; relationship?: string }>;
      idempotency_key: string;
    }) => membershipsApi.purchase(c, id, input),
    onSuccess: async () => q.invalidateQueries({ queryKey: membershipKeys.mine }),
  });
}
export function useCreateCorporateAccountMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: CorporateAccountInput) =>
      membershipsApi.createCorporateAccount(c, org, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-accounts", org] }),
  });
}
export function useUpdateCorporateAccountMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CorporateAccountPatch }) =>
      membershipsApi.updateCorporateAccount(c, org, id, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-accounts", org] }),
  });
}
export function useAddCorporateMemberMutation(org: string, accountId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: CorporateMemberInput) =>
      membershipsApi.addCorporateMember(c, org, accountId, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-members", org, accountId] }),
  });
}
export function useUpdateCorporateMemberMutation(org: string, accountId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CorporateMemberPatch }) =>
      membershipsApi.updateCorporateMember(c, org, accountId, id, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-members", org, accountId] }),
  });
}
export function useCreateCorporateContractMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: (input: CorporateContractInput) =>
      membershipsApi.createCorporateContract(c, org, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] }),
  });
}
export function useUpdateCorporateContractMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CorporateContractPatch }) =>
      membershipsApi.updateCorporateContract(c, org, id, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] }),
  });
}
export function useEnrollCorporateMemberMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, memberId }: { contractId: string; memberId: string }) =>
      membershipsApi.enrollCorporateMember(c, org, contractId, {
        corporate_member_id: memberId,
        idempotency_key: crypto.randomUUID(),
      }),
    onSuccess: async () => {
      await q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] });
      await q.invalidateQueries({ queryKey: ["memberships", "contracts", org] });
    },
  });
}
export function useAdminMembershipStatusMutation() {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      resource,
      id,
      status,
      reason,
    }: {
      resource: AdminMembershipResource;
      id: string;
      status: "draft" | "active" | "suspended" | "ended" | "archived" | "cancelled";
      reason: string;
    }) => membershipsApi.adminStatus(c, resource, id, status, reason),
    onSuccess: async () => q.invalidateQueries({ queryKey: ["admin", "memberships"] }),
  });
}
export function useEndCorporateEnrollmentMutation(org: string, contractId: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, reason }: { enrollmentId: string; reason: string }) =>
      membershipsApi.endCorporateEnrollment(c, org, contractId, enrollmentId, reason),
    onSuccess: async () => {
      await q.invalidateQueries({
        queryKey: ["memberships", "corporate-enrollments", org, contractId],
      });
      await q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] });
    },
  });
}
export function useRenewCorporateContractMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      contractId,
      ...input
    }: {
      contractId: string;
      ends_at: string | Date;
      budget_amount_minor?: string;
      extend_active_enrollments?: boolean;
    }) => membershipsApi.renewCorporateContract(c, org, contractId, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] }),
  });
}
export function useResetCorporateBudgetMutation(org: string) {
  const c = useApiClient(),
    q = useQueryClient();
  return useMutation({
    mutationFn: ({
      contractId,
      ...input
    }: {
      contractId: string;
      amount_minor?: string;
      reason: string;
    }) => membershipsApi.resetCorporateBudget(c, org, contractId, input),
    onSuccess: async () =>
      q.invalidateQueries({ queryKey: ["memberships", "corporate-contracts", org] }),
  });
}
