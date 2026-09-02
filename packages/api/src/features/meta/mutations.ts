"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { metaApi } from "./api";
import { metaKeys } from "./queries";
import type { SportTermCreateInput, SportTermPatchInput } from "./types";
import type { ConfigurationResource } from "./types";

export function useCreateSportTermMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: SportTermCreateInput) => metaApi.createSportTerm(client, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.sports() }),
  });
}
export function useUpdateSportTermMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ termId, input }: { termId: string; input: SportTermPatchInput }) =>
      metaApi.updateSportTerm(client, termId, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.sports() }),
  });
}
export function useArchiveSportTermMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (termId: string) => metaApi.archiveSportTerm(client, termId),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.sports() }),
  });
}
export function useCreateEntityTypeMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => metaApi.createEntity(client, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.all }),
  });
}
export function useCreateFieldGroupMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => metaApi.createGroup(client, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.all }),
  });
}
export function useCreateFieldDefinitionMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => metaApi.createField(client, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: metaKeys.all }),
  });
}
export function useCreateConfigurationMutation(resource: ConfigurationResource) {
  const client = useApiClient(),
    cache = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      metaApi.createConfiguration(client, resource, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["meta", "configuration", resource] }),
  });
}
export function useUpdateConfigurationMutation(resource: ConfigurationResource) {
  const client = useApiClient(),
    cache = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      metaApi.updateConfiguration(client, resource, id, input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["meta", "configuration", resource] }),
  });
}
export function useArchiveConfigurationMutation(resource: ConfigurationResource) {
  const client = useApiClient(),
    cache = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => metaApi.archiveConfiguration(client, resource, id),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["meta", "configuration", resource] }),
  });
}
