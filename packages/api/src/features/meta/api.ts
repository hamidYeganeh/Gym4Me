import type { ApiClient } from "../../core/client";
import type {
  EntitySchema,
  FormDefinition,
  SportCatalog,
  SportTerm,
  SportTermCreateInput,
  SportTermPatchInput,
  TaxonomyTerms,
  ConfigurationResource,
  ConfigurationListParams,
} from "./types";

const segment = encodeURIComponent;

export const metaApi = {
  async configurationList(
    client: ApiClient,
    resource: ConfigurationResource,
    params: ConfigurationListParams = {},
    signal?: AbortSignal,
  ) {
    const response = await client.get<Record<string, unknown>[]>(
      `/admin/configuration/${segment(resource)}`,
      { query: params as any, ...(signal ? { signal } : {}) },
    );
    return { items: response.data, pagination: (response.meta as any).pagination };
  },
  async createConfiguration(
    client: ApiClient,
    resource: ConfigurationResource,
    input: Record<string, unknown>,
  ) {
    return (
      await client.post<Record<string, unknown>>(`/admin/configuration/${segment(resource)}`, input)
    ).data;
  },
  async updateConfiguration(
    client: ApiClient,
    resource: ConfigurationResource,
    id: string,
    input: Record<string, unknown>,
  ) {
    return (
      await client.patch<Record<string, unknown>>(
        `/admin/configuration/${segment(resource)}/${segment(id)}`,
        input,
      )
    ).data;
  },
  async archiveConfiguration(client: ApiClient, resource: ConfigurationResource, id: string) {
    return (
      await client.delete<Record<string, unknown>>(
        `/admin/configuration/${segment(resource)}/${segment(id)}`,
      )
    ).data;
  },
  async getSportCatalog(client: ApiClient, signal?: AbortSignal): Promise<SportCatalog> {
    return (await client.get<SportCatalog>("/sports/catalog", signal ? { signal } : undefined))
      .data;
  },
  async getAdminSportCatalog(client: ApiClient, signal?: AbortSignal): Promise<SportCatalog> {
    return (
      await client.get<SportCatalog>("/admin/configuration/sports", signal ? { signal } : undefined)
    ).data;
  },
  async createSportTerm(client: ApiClient, input: SportTermCreateInput): Promise<SportTerm> {
    return (
      await client.post<SportTerm, SportTermCreateInput>("/admin/configuration/sports", input)
    ).data;
  },
  async updateSportTerm(
    client: ApiClient,
    termId: string,
    input: SportTermPatchInput,
  ): Promise<SportTerm> {
    return (
      await client.patch<SportTerm, SportTermPatchInput>(
        `/admin/configuration/sports/${segment(termId)}`,
        input,
      )
    ).data;
  },
  async archiveSportTerm(client: ApiClient, termId: string) {
    return (
      await client.delete<{ archived: number }>(`/admin/configuration/sports/${segment(termId)}`)
    ).data;
  },
  async createEntity(client: ApiClient, input: Record<string, unknown>) {
    return (
      await client.post<Record<string, unknown>, Record<string, unknown>>(
        "/admin/configuration/entity-types",
        input,
      )
    ).data;
  },
  async createGroup(client: ApiClient, input: Record<string, unknown>) {
    return (
      await client.post<Record<string, unknown>, Record<string, unknown>>(
        "/admin/configuration/field-groups",
        input,
      )
    ).data;
  },
  async createField(client: ApiClient, input: Record<string, unknown>) {
    return (
      await client.post<Record<string, unknown>, Record<string, unknown>>(
        "/admin/configuration/field-definitions",
        input,
      )
    ).data;
  },
  async getEntitySchema(
    client: ApiClient,
    entityType: string,
    signal?: AbortSignal,
  ): Promise<EntitySchema> {
    return (
      await client.get<EntitySchema>(
        `/meta/entities/${segment(entityType)}/schema`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async getForm(
    client: ApiClient,
    formCode: string,
    signal?: AbortSignal,
  ): Promise<FormDefinition> {
    return (
      await client.get<FormDefinition>(
        `/meta/forms/${segment(formCode)}`,
        signal ? { signal } : undefined,
      )
    ).data;
  },

  async getTaxonomyTerms(
    client: ApiClient,
    taxonomyCode: string,
    signal?: AbortSignal,
  ): Promise<TaxonomyTerms> {
    return (
      await client.get<TaxonomyTerms>(
        `/meta/taxonomies/${segment(taxonomyCode)}/terms`,
        signal ? { signal } : undefined,
      )
    ).data;
  },
};
