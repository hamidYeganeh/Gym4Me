import type { EntitySchemaContract } from "../../core/contracts";

export interface EntitySchema extends EntitySchemaContract {
  groups?: Record<string, unknown>[];
}

export type FormDefinition = Record<string, unknown>;

export interface TaxonomyTerms {
  taxonomy: Record<string, unknown>;
  terms: Record<string, unknown>[];
}

export type SportLevel = "category" | "sport" | "branch";

export interface SportTerm {
  id: string;
  code: string;
  label: string;
  labels: Record<string, string>;
  icon?: string;
  level: SportLevel;
  display_order: number;
  status: "active" | "inactive";
}

export interface Sport extends SportTerm {
  level: "sport";
  branches: Array<SportTerm & { level: "branch" }>;
}

export interface SportCategory extends SportTerm {
  level: "category";
  sports: Sport[];
}

export interface SportCatalog {
  categories: SportCategory[];
  total_terms: number;
}

export interface SportTermCreateInput {
  code: string;
  level: SportLevel;
  parent_id?: string;
  label_fa: string;
  label_en?: string;
  icon?: string;
  display_order?: number;
}

export interface SportTermPatchInput {
  label_fa?: string;
  label_en?: string;
  icon?: string | null;
  display_order?: number;
  status?: "active" | "inactive";
}

export type ConfigurationResource =
  | "entity-types"
  | "field-groups"
  | "field-definitions"
  | "forms"
  | "taxonomies"
  | "taxonomy-terms"
  | "workflows"
  | "feature-flags"
  | "system-settings";
export interface ConfigurationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "draft" | "archived";
  entity_type_id?: string;
  taxonomy_id?: string;
}
