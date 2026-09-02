"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { organizationsApi } from "./api";
import { organizationKeys } from "./queries";
import type {
  BranchInput,
  BranchPatch,
  ClubInput,
  ClubPatch,
  ClubVerificationInput,
  OrganizationInput,
  OrganizationInvitationInput,
  OrganizationPatch,
  StatusUpdateInput,
} from "./types";

export function useCreateOrganizationMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationInput) => organizationsApi.create(client, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
  });
}

export function useUpdateOrganizationMutation(organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationPatch) =>
      organizationsApi.update(client, organizationId, input),
    onSuccess: (organization) => {
      queryClient.setQueryData(organizationKeys.detail(organizationId), organization);
      return queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useCreateClubMutation(organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClubInput) => organizationsApi.createClub(client, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...organizationKeys.detail(organizationId), "clubs"],
      }),
  });
}

export function useCreateBranchMutation(clubId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BranchInput) => organizationsApi.createBranch(client, clubId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...organizationKeys.all, "club", clubId, "branches"],
      }),
  });
}

export function useUpdateClubMutation(clubId: string, organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClubPatch) => organizationsApi.updateClub(client, clubId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.club(clubId) });
      void queryClient.invalidateQueries({ queryKey: organizationKeys.clubs(organizationId, {}) });
    },
  });
}

export function useUpdateBranchMutation(branchId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BranchPatch) => organizationsApi.updateBranch(client, branchId, input),
    onSuccess: (branch) => queryClient.setQueryData(organizationKeys.branch(branchId), branch),
  });
}

export function useInviteOrganizationMemberMutation(organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationInvitationInput) =>
      organizationsApi.invite(client, organizationId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: organizationKeys.invitations(organizationId) }),
  });
}

export function useUpdateOrganizationStatusMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ organizationId, input }: { organizationId: string; input: StatusUpdateInput }) =>
      organizationsApi.updateOrganizationStatus(client, organizationId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] }),
  });
}

export function useUpdateBranchStatusMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, input }: { branchId: string; input: StatusUpdateInput }) =>
      organizationsApi.updateBranchStatus(client, branchId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "branches"] }),
  });
}

export function useVerifyClubMutation() {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clubId, input }: { clubId: string; input: ClubVerificationInput }) =>
      organizationsApi.verifyClub(client, clubId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "clubs"] }),
  });
}

export function useRevokeOrganizationInvitationMutation(organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationsApi.revokeInvitation(client, organizationId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: organizationKeys.invitations(organizationId) }),
  });
}

export function useUpdateOrganizationMemberStatusMutation(organizationId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      status,
    }: {
      memberId: string;
      status: "active" | "suspended" | "ended";
    }) => organizationsApi.updateMemberStatus(client, organizationId, memberId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) }),
  });
}

export function useSetBranchWorkingHoursMutation(branchId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (days: Record<string, unknown>[]) =>
      organizationsApi.setWorkingHours(client, branchId, days),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationKeys.branch(branchId) }),
  });
}

export function useAddBranchHolidayMutation(branchId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      organizationsApi.addHoliday(client, branchId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationKeys.branch(branchId) }),
  });
}

export function useRemoveBranchHolidayMutation(branchId: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (holidayId: string) => organizationsApi.removeHoliday(client, branchId, holidayId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationKeys.branch(branchId) }),
  });
}
