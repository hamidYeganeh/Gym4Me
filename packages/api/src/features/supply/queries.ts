"use client";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { supplyApi } from "./api";
import type {
  CatalogBranchParams,
  CatalogParams,
  PaginationParams,
  SlotSearchParams,
} from "./types";
export const supplyKeys = {
  all: ["supply"] as const,
  branches: (params: CatalogBranchParams) => ["supply", "branches", "public", params] as const,
  resources: (branchId: string, params: unknown, visibility: string) =>
    ["supply", "resources", visibility, branchId, params] as const,
  offerings: (branchId: string, params: unknown, visibility: string) =>
    ["supply", "offerings", visibility, branchId, params] as const,
  rules: (resourceId: string) => ["supply", "availability", resourceId, "rules"] as const,
  exceptions: (resourceId: string) => ["supply", "availability", resourceId, "exceptions"] as const,
  slots: (resourceId: string, params: SlotSearchParams, visibility: string) =>
    ["supply", "availability", resourceId, "slots", visibility, params] as const,
  admin: (entity: string, params: unknown) => ["admin", "catalog", entity, params] as const,
};
export function useCatalogBranchesQuery(
  params: CatalogBranchParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.branches(params),
    queryFn: ({ signal }) => supplyApi.catalogBranches(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
export function useResourcesQuery(
  branchId: string,
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.resources(branchId, params, "managed"),
    queryFn: ({ signal }) => supplyApi.resources(client, branchId, params, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}
export function useCatalogResourcesQuery(
  branchId: string,
  params: CatalogParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.resources(branchId, params, "public"),
    queryFn: ({ signal }) => supplyApi.catalogResources(client, branchId, params, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}
export function useOfferingsQuery(
  branchId: string,
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.offerings(branchId, params, "managed"),
    queryFn: ({ signal }) => supplyApi.offerings(client, branchId, params, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}
export function useCatalogOfferingsQuery(
  branchId: string,
  params: CatalogParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.offerings(branchId, params, "public"),
    queryFn: ({ signal }) => supplyApi.catalogOfferings(client, branchId, params, signal),
    enabled: Boolean(branchId) && (options.enabled ?? true),
  });
}
export function useAvailabilitySlotsQuery(
  resourceId: string,
  params: SlotSearchParams,
  isPublic = true,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.slots(resourceId, params, isPublic ? "public" : "managed"),
    queryFn: ({ signal }) => supplyApi.slots(client, resourceId, params, isPublic, signal),
    enabled: Boolean(resourceId) && (options.enabled ?? true),
    staleTime: 30_000,
  });
}
export function useAvailabilityRulesQuery(resourceId: string, options: { enabled?: boolean } = {}) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.rules(resourceId),
    queryFn: ({ signal }) => supplyApi.rules(client, resourceId, signal),
    enabled: Boolean(resourceId) && (options.enabled ?? true),
  });
}
export function useAvailabilityExceptionsQuery(
  resourceId: string,
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.exceptions(resourceId),
    queryFn: ({ signal }) => supplyApi.exceptions(client, resourceId, signal),
    enabled: Boolean(resourceId) && (options.enabled ?? true),
  });
}
export function useAdminCatalogQuery(
  entity: "resources" | "offerings",
  params: PaginationParams = {},
  options: { enabled?: boolean } = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: supplyKeys.admin(entity, params),
    queryFn: ({ signal }) =>
      entity === "resources"
        ? supplyApi.adminResources(client, params, signal)
        : supplyApi.adminOfferings(client, params, signal),
    enabled: options.enabled ?? true,
  });
}
