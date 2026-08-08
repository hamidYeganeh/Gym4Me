import type { ListAdminUsersQuery } from "./users.dto";

export const adminUsersKeys = {
  all: ["admin", "users"] as const,
  lists: () => [...adminUsersKeys.all, "list"] as const,
  list: (query: ListAdminUsersQuery = {}) =>
    [...adminUsersKeys.lists(), query] as const,
  details: () => [...adminUsersKeys.all, "detail"] as const,
  detail: (userId: string) => [...adminUsersKeys.details(), userId] as const,
};
