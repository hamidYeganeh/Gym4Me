import type { ApiClient } from "../client";
import type { ApplyRoleInput, ApplyRoleResponse } from "./roles.dto";
import { accountRolesEndpoints as ep } from "./roles.endpoint";

/** Account role membership (`/account/roles`). */
export function createAccountRolesApi(client: ApiClient) {
  return {
    apply(input: ApplyRoleInput) {
      return client.request<ApplyRoleResponse>(ep.apply, {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountRolesApi = ReturnType<typeof createAccountRolesApi>;
