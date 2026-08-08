import type { ApiClient } from "../client";
import type {
  ChoiceGroup,
  ItemsResponse,
  LocationNode,
  RefItem,
  RefType,
  SportNode,
  SuccessResponse,
} from "../types";
import type {
  AdminCreateChoiceGroupInput,
  AdminCreateLocationInput,
  AdminCreateRefItemInput,
  AdminCreateSportInput,
  AdminRefListResponse,
  AdminUpdateChoiceGroupInput,
  AdminUpdateLocationInput,
  AdminUpdateRefItemInput,
  AdminUpdateSportInput,
  ListAdminLocationsQuery,
  ListAdminSportsQuery,
} from "./basics.dto";
import { adminBasicsEndpoints as ep } from "./basics.endpoint";

/** Admin reference-data management (`/admin/basics`). */
export function createAdminBasicsApi(client: ApiClient) {
  return {
    // ── Choices ──────────────────────────────────

    listChoices() {
      return client.request<ItemsResponse<ChoiceGroup>>(ep.choices);
    },

    createChoice(input: AdminCreateChoiceGroupInput) {
      return client.request<ChoiceGroup>(ep.choices, {
        method: "POST",
        body: input,
      });
    },

    updateChoice(key: string, input: AdminUpdateChoiceGroupInput) {
      return client.request<ChoiceGroup>(ep.choiceByKey(key), {
        method: "PATCH",
        body: input,
      });
    },

    deleteChoice(key: string) {
      return client.request<SuccessResponse>(ep.choiceByKey(key), {
        method: "DELETE",
      });
    },

    // ── Locations ────────────────────────────────

    listLocations(query: ListAdminLocationsQuery) {
      return client.request<ItemsResponse<LocationNode>>(ep.location, {
        query,
      });
    },

    getLocation(id: string) {
      return client.request<LocationNode>(ep.locationById(id));
    },

    createLocation(input: AdminCreateLocationInput) {
      return client.request<LocationNode>(ep.location, {
        method: "POST",
        body: input,
      });
    },

    updateLocation(id: string, input: AdminUpdateLocationInput) {
      return client.request<LocationNode>(ep.locationById(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteLocation(id: string) {
      return client.request<SuccessResponse>(ep.locationById(id), {
        method: "DELETE",
      });
    },

    // ── Sports ───────────────────────────────────

    listSports(query: ListAdminSportsQuery = {}) {
      return client.request<ItemsResponse<SportNode>>(ep.sport, {
        query,
      });
    },

    getSport(id: string) {
      return client.request<SportNode>(ep.sportById(id));
    },

    createSport(input: AdminCreateSportInput) {
      return client.request<SportNode>(ep.sport, {
        method: "POST",
        body: input,
      });
    },

    updateSport(id: string, input: AdminUpdateSportInput) {
      return client.request<SportNode>(ep.sportById(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteSport(id: string) {
      return client.request<SuccessResponse>(ep.sportById(id), {
        method: "DELETE",
      });
    },

    // ── Generic refs ─────────────────────────────

    listRefs(type: RefType) {
      return client.request<AdminRefListResponse>(ep.ref(type));
    },

    getRef(type: RefType, id: string) {
      return client.request<RefItem>(ep.refById(type, id));
    },

    createRef(type: RefType, input: AdminCreateRefItemInput) {
      return client.request<RefItem>(ep.ref(type), {
        method: "POST",
        body: input,
      });
    },

    updateRef(type: RefType, id: string, input: AdminUpdateRefItemInput) {
      return client.request<RefItem>(ep.refById(type, id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteRef(type: RefType, id: string) {
      return client.request<SuccessResponse>(ep.refById(type, id), {
        method: "DELETE",
      });
    },
  };
}

export type AdminBasicsApi = ReturnType<typeof createAdminBasicsApi>;
