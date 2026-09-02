"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ApiClient } from "../../core/client";
import { useApiClient } from "../../core/provider";
import { organizationsApi } from "./api";
import type { PaginationParams } from "./types";

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...organizationKeys.lists(), params] as const,
  detail: (organizationId: string) => [...organizationKeys.all, "detail", organizationId] as const,
  club: (clubId: string) => [...organizationKeys.all, "club", clubId] as const,
  branch: (branchId: string) => [...organizationKeys.all, "branch", branchId] as const,
  clubs: (organizationId: string, params: PaginationParams) =>
    [...organizationKeys.detail(organizationId), "clubs", params] as const,
  branchList: (clubId: string, params: PaginationParams) =>
    [...organizationKeys.all, "club", clubId, "branches", params] as const,
  admin: (entity: "organizations" | "clubs" | "branches", params: PaginationParams) =>
    ["admin", entity, params] as const,
  members: (organizationId: string) =>
    [...organizationKeys.detail(organizationId), "members"] as const,
  invitations: (organizationId: string) =>
    [...organizationKeys.detail(organizationId), "invitations"] as const,
};

export function organizationsQueryOptions(client: ApiClient, params: PaginationParams = {}) {
  return queryOptions({
    queryKey: organizationKeys.list(params),
    queryFn: ({ signal }) => organizationsApi.list(client, params, signal),
  });
}

export function organizationQueryOptions(client: ApiClient, organizationId: string) {
  return queryOptions({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: ({ signal }) => organizationsApi.get(client, organizationId, signal),
  });
}

export function clubsQueryOptions(
  client: ApiClient,
  organizationId: string,
  params: PaginationParams = {},
) {
  return queryOptions({
    queryKey: organizationKeys.clubs(organizationId, params),
    queryFn: ({ signal }) => organizationsApi.listClubs(client, organizationId, params, signal),
  });
}

export function branchesQueryOptions(
  client: ApiClient,
  clubId: string,
  params: PaginationParams = {},
) {
  return queryOptions({
    queryKey: organizationKeys.branchList(clubId, params),
    queryFn: ({ signal }) => organizationsApi.listBranches(client, clubId, params, signal),
  });
}

export function useOrganizationsQuery(
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({ ...organizationsQueryOptions(useApiClient(), params), ...options });
}

export function useOrganizationQuery(organizationId: string, options: { enabled?: boolean } = {}) {
  return useQuery({ ...organizationQueryOptions(useApiClient(), organizationId), ...options });
}

export function useClubsQuery(
  organizationId: string,
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({ ...clubsQueryOptions(useApiClient(), organizationId, params), ...options });
}

export function useBranchesQuery(
  clubId: string,
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({ ...branchesQueryOptions(useApiClient(), clubId, params), ...options });
}

export function useClubQuery(clubId: string, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.club(clubId),
    queryFn: ({ signal }) => organizationsApi.getClub(client, clubId, signal),
    enabled: Boolean(clubId) && (options.enabled ?? true),
  });
}

export function useBranchQuery(branchId: string, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.branch(branchId),
    queryFn: ({ signal }) => organizationsApi.getBranch(client, branchId, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}

export function useOrganizationMembersQuery(
  organizationId: string,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.members(organizationId),
    queryFn: ({ signal }) => organizationsApi.members(client, organizationId, signal),
    enabled: Boolean(organizationId) && (options.enabled ?? true),
  });
}

export function useOrganizationInvitationsQuery(
  organizationId: string,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.invitations(organizationId),
    queryFn: ({ signal }) => organizationsApi.invitations(client, organizationId, signal),
    enabled: Boolean(organizationId) && (options.enabled ?? true),
  });
}

export function useAdminOrganizationsQuery(
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.admin("organizations", params),
    queryFn: ({ signal }) => organizationsApi.adminOrganizations(client, params, signal),
    enabled: options.enabled ?? true,
  });
}

export function useAdminClubsQuery(
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.admin("clubs", params),
    queryFn: ({ signal }) => organizationsApi.adminClubs(client, params, signal),
    enabled: options.enabled ?? true,
  });
}

export function useAdminBranchesQuery(
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: organizationKeys.admin("branches", params),
    queryFn: ({ signal }) => organizationsApi.adminBranches(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
