"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { supplyApi } from "./api";
import { supplyKeys } from "./queries";
import type {
  AvailabilityExceptionInput,
  AvailabilityRuleInput,
  OfferingInput,
  ResourceInput,
} from "./types";
export function useCreateResourceMutation(branchId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: ResourceInput) => supplyApi.createResource(client, branchId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["supply", "resources"] }),
  });
}
export function useCreateOfferingMutation(organizationId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferingInput) => supplyApi.createOffering(client, organizationId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["supply", "offerings"] }),
  });
}
export function useCreateAvailabilityRuleMutation(resourceId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: AvailabilityRuleInput) => supplyApi.createRule(client, resourceId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: supplyKeys.rules(resourceId) }),
  });
}
export function useCreateAvailabilityExceptionMutation(resourceId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: AvailabilityExceptionInput) =>
      supplyApi.createException(client, resourceId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["supply", "availability", resourceId] }),
  });
}
export function useUpdateAvailabilityExceptionMutation(resourceId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      exceptionId,
      input,
    }: {
      exceptionId: string;
      input: Partial<AvailabilityExceptionInput>;
    }) => supplyApi.updateException(client, exceptionId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: supplyKeys.exceptions(resourceId) }),
  });
}
export function useArchiveAvailabilityExceptionMutation(resourceId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (exceptionId: string) => supplyApi.archiveException(client, exceptionId),
    onSuccess: () => cache.invalidateQueries({ queryKey: supplyKeys.exceptions(resourceId) }),
  });
}
export function useAdminCatalogStatusMutation(entity: "resources" | "offerings") {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      supplyApi.updateAdminStatus(client, entity, id, status),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["admin", "catalog", entity] }),
  });
}
