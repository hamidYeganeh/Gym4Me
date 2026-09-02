import type { ApiEntity, PaginatedResult, PaginationParams } from "../organizations/types";
export type { ApiEntity };
export interface AdminUserListParams extends PaginationParams {
  search?: string;
  status?: string;
}
export type AdminUserList = PaginatedResult<ApiEntity>;
export interface AdminRoleInput {
  code: string;
  name: string;
  type: "custom" | "admin" | "organization_default";
  scope_type: "global" | "self" | "organization" | "branch";
  permissions: string[];
  status: "active" | "inactive" | "archived";
}
