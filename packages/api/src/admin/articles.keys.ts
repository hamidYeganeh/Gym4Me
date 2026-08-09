import type { ListAdminArticlesQuery } from "./articles.dto";

export const adminArticlesKeys = {
  all: ["admin", "articles"] as const,
  lists: () => [...adminArticlesKeys.all, "list"] as const,
  list: (query: ListAdminArticlesQuery = {}) =>
    [...adminArticlesKeys.lists(), query] as const,
  detail: (id: string) => [...adminArticlesKeys.all, "detail", id] as const,
};
