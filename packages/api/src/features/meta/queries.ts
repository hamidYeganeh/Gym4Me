"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ApiClient } from "../../core/client";
import { useApiClient } from "../../core/provider";
import { metaApi } from "./api";
import type { ConfigurationListParams, ConfigurationResource } from "./types";

export const metaKeys = {
  all: ["meta"] as const,
  sports: () => [...metaKeys.all, "sports"] as const,
  adminSports: () => [...metaKeys.all, "sports", "admin"] as const,
  entitySchema: (entityType: string) => [...metaKeys.all, "entity-schema", entityType] as const,
  form: (formCode: string) => [...metaKeys.all, "form", formCode] as const,
  taxonomy: (taxonomyCode: string) => [...metaKeys.all, "taxonomy", taxonomyCode] as const,
  configuration: (resource: string, params: unknown) =>
    [...metaKeys.all, "configuration", resource, params] as const,
};

export function sportCatalogQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: metaKeys.sports(),
    queryFn: ({ signal }) => metaApi.getSportCatalog(client, signal),
    staleTime: 300_000,
  });
}

export function adminSportCatalogQueryOptions(client: ApiClient) {
  return queryOptions({
    queryKey: metaKeys.adminSports(),
    queryFn: ({ signal }) => metaApi.getAdminSportCatalog(client, signal),
  });
}

export function useSportCatalogQuery(options: { enabled?: boolean } = {}) {
  return useQuery({ ...sportCatalogQueryOptions(useApiClient()), ...options });
}

export function useAdminSportCatalogQuery(options: { enabled?: boolean } = {}) {
  return useQuery({ ...adminSportCatalogQueryOptions(useApiClient()), ...options });
}

export function entitySchemaQueryOptions(client: ApiClient, entityType: string) {
  return queryOptions({
    queryKey: metaKeys.entitySchema(entityType),
    queryFn: ({ signal }) => metaApi.getEntitySchema(client, entityType, signal),
  });
}

export function formQueryOptions(client: ApiClient, formCode: string) {
  return queryOptions({
    queryKey: metaKeys.form(formCode),
    queryFn: ({ signal }) => metaApi.getForm(client, formCode, signal),
  });
}

export function taxonomyTermsQueryOptions(client: ApiClient, taxonomyCode: string) {
  return queryOptions({
    queryKey: metaKeys.taxonomy(taxonomyCode),
    queryFn: ({ signal }) => metaApi.getTaxonomyTerms(client, taxonomyCode, signal),
  });
}

export function useEntitySchemaQuery(entityType: string, options: { enabled?: boolean } = {}) {
  return useQuery({ ...entitySchemaQueryOptions(useApiClient(), entityType), ...options });
}

export function useFormQuery(formCode: string, options: { enabled?: boolean } = {}) {
  return useQuery({ ...formQueryOptions(useApiClient(), formCode), ...options });
}

export function useTaxonomyTermsQuery(taxonomyCode: string, options: { enabled?: boolean } = {}) {
  return useQuery({ ...taxonomyTermsQueryOptions(useApiClient(), taxonomyCode), ...options });
}

export function useConfigurationListQuery(
  resource: ConfigurationResource,
  params: ConfigurationListParams = {},
) {
  const client = useApiClient();
  return useQuery({
    queryKey: metaKeys.configuration(resource, params),
    queryFn: ({ signal }) => metaApi.configurationList(client, resource, params, signal),
  });
}
