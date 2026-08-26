export const inventoryKeys = {
  all: ["inventory"] as const,
  list: (clubId: string, query: Record<string, unknown> = {}) =>
    [...inventoryKeys.all, "list", clubId, query] as const,
} as const;
