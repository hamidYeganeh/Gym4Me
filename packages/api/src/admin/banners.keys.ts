import type { ListAdminBannersQuery } from "./banners.dto";

export const adminBannersKeys = {
  all: ["admin", "banners"] as const,
  lists: () => [...adminBannersKeys.all, "list"] as const,
  list: (query: ListAdminBannersQuery = {}) =>
    [...adminBannersKeys.lists(), query] as const,
  detail: (id: string) => [...adminBannersKeys.all, "detail", id] as const,
};
