import type { ApiClient } from "../client";
import { clubStaffEndpoints as ep } from "./staff.endpoint";
import type {
  ClubStaffMember,
  ListStaffQuery,
  StaffPage,
  UpdateStaffPermissionsInput,
  UpsertStaffInput,
} from "./staff.dto";

export function createClubStaffApi(client: ApiClient) {
  return {
    list(clubId: string, query: ListStaffQuery = {}) {
      return client.request<StaffPage>(ep.root(clubId), { query });
    },

    upsert(clubId: string, input: UpsertStaffInput) {
      return client.request<ClubStaffMember>(ep.root(clubId), {
        method: "POST",
        body: input,
      });
    },

    update(
      clubId: string,
      staffId: string,
      input: UpdateStaffPermissionsInput,
    ) {
      return client.request<ClubStaffMember>(ep.byId(clubId, staffId), {
        method: "PATCH",
        body: input,
      });
    },

    revoke(clubId: string, staffId: string) {
      return client.request<ClubStaffMember>(ep.byId(clubId, staffId), {
        method: "DELETE",
      });
    },
  };
}

export type ClubStaffApi = ReturnType<typeof createClubStaffApi>;
