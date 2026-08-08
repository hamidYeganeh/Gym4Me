import type { ListSportsQuery } from "./sports.dto";

export const basicsSportsKeys = {
  all: ["basics", "sports"] as const,
  categories: () => [...basicsSportsKeys.all, "categories"] as const,
  sports: (query: ListSportsQuery = {}) =>
    [...basicsSportsKeys.all, "list", query] as const,
  categorySports: (categoryId: string) =>
    [...basicsSportsKeys.all, "categorySports", categoryId] as const,
  detail: (id: string) => [...basicsSportsKeys.all, "detail", id] as const,
};
