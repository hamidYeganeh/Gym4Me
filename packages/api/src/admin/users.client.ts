import type { ApiClient } from "../client";
import type { Paginated, PublicUser } from "../types";
import type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUpdateUserRolesInput,
  AdminUpdateUserStatusInput,
  AdminUserActivationInput,
  ListAdminUsersQuery,
} from "./users.dto";
import { adminUsersEndpoints as ep } from "./users.endpoint";

/** Admin ops user management (`/admin/users`). */
export function createAdminUsersApi(client: ApiClient) {
  return {
    list(query: ListAdminUsersQuery = {}) {
      return client.request<Paginated<PublicUser>>(ep.root, {
        query,
      });
    },

    get(userId: string) {
      return client.request<PublicUser>(ep.byId(userId));
    },

    create(input: AdminCreateUserInput) {
      return client.request<PublicUser>(ep.root, {
        method: "POST",
        body: input,
      });
    },

    update(userId: string, input: AdminUpdateUserInput) {
      return client.request<PublicUser>(ep.byId(userId), {
        method: "PATCH",
        body: input,
      });
    },

    updateStatus(userId: string, input: AdminUpdateUserStatusInput) {
      return client.request<PublicUser>(ep.status(userId), {
        method: "PATCH",
        body: input,
      });
    },

    activate(userId: string, input: AdminUserActivationInput = {}) {
      return client.request<PublicUser>(ep.activate(userId), {
        method: "PATCH",
        body: input,
      });
    },

    deactivate(userId: string, input: AdminUserActivationInput = {}) {
      return client.request<PublicUser>(ep.deactivate(userId), {
        method: "PATCH",
        body: input,
      });
    },

    updateRoles(userId: string, input: AdminUpdateUserRolesInput) {
      return client.request<PublicUser>(ep.roles(userId), {
        method: "PATCH",
        body: input,
      });
    },

    remove(userId: string) {
      return client.request<PublicUser>(ep.byId(userId), {
        method: "DELETE",
      });
    },
  };
}

export type AdminUsersApi = ReturnType<typeof createAdminUsersApi>;
