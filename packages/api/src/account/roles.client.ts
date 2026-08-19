import type { ApiClient } from "../client";
import type { Role } from "../types";
import type {
  ApplyRoleInput,
  ApplyRoleResponse,
  RoleOverviewResponse,
  SubmitRoleRequestInput,
  SubmitRoleRequestResponse,
} from "./roles.dto";
import { accountRolesEndpoints as ep } from "./roles.endpoint";

/** Account role membership (`/account/roles`). */
export function createAccountRolesApi(client: ApiClient) {
  return {
    list() {
      return client.request<RoleOverviewResponse>(ep.list);
    },

    apply(input: ApplyRoleInput) {
      return client.request<ApplyRoleResponse>(ep.apply, {
        method: "POST",
        body: input,
      });
    },

    submit(role: Role, input: SubmitRoleRequestInput) {
      return client.request<SubmitRoleRequestResponse>(ep.submit(role), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountRolesApi = ReturnType<typeof createAccountRolesApi>;
