export const CONFIGURATION_RESOURCES = [
  "entity-types",
  "field-groups",
  "field-definitions",
  "forms",
  "taxonomies",
  "taxonomy-terms",
  "workflows",
  "feature-flags",
  "system-settings",
] as const;
export type ConfigurationResourcePath = (typeof CONFIGURATION_RESOURCES)[number];

export const CONFIGURATION_STATUSES = ["active", "inactive", "draft", "archived"] as const;
export type ConfigurationStatus = (typeof CONFIGURATION_STATUSES)[number];

export const SPORT_LEVELS = ["category", "sport", "branch"] as const;
export type SportLevel = (typeof SPORT_LEVELS)[number];
