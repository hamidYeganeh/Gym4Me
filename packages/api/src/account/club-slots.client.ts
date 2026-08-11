import type { ApiClient } from "../client";
import type {
  CancelSlotOccurrenceInput,
  ClubClass,
  ClubClassesList,
  ClubSlot,
  ClubSlotsList,
  ClubSpace,
  ClubSpacesList,
  CreateClubClassInput,
  CreateClubSlotInput,
  CreateClubSpaceInput,
  UpdateClubClassInput,
  UpdateClubSlotInput,
  UpdateClubSpaceInput,
} from "./club-slots.dto";
import { accountClubSlotsEndpoints as ep } from "./club-slots.endpoint";

/** Club-owner classes & slots. */
export function createClubOwnerClubSlotsApi(client: ApiClient) {
  return {
    listClasses(clubId: string) {
      return client.request<ClubClassesList>(ep.classes(clubId));
    },

    getClass(clubId: string, classId: string) {
      return client.request<ClubClass>(ep.classById(clubId, classId));
    },

    createClass(clubId: string, input: CreateClubClassInput) {
      return client.request<ClubClass>(ep.classes(clubId), {
        method: "POST",
        body: input,
      });
    },

    updateClass(clubId: string, classId: string, input: UpdateClubClassInput) {
      return client.request<ClubClass>(ep.classById(clubId, classId), {
        method: "PATCH",
        body: input,
      });
    },

    archiveClass(clubId: string, classId: string) {
      return client.request<ClubClass>(ep.classById(clubId, classId), {
        method: "DELETE",
      });
    },

    listSpaces(clubId: string) {
      return client.request<ClubSpacesList>(ep.spaces(clubId));
    },

    getSpace(clubId: string, spaceId: string) {
      return client.request<ClubSpace>(ep.spaceById(clubId, spaceId));
    },

    createSpace(clubId: string, input: CreateClubSpaceInput) {
      return client.request<ClubSpace>(ep.spaces(clubId), {
        method: "POST",
        body: input,
      });
    },

    updateSpace(clubId: string, spaceId: string, input: UpdateClubSpaceInput) {
      return client.request<ClubSpace>(ep.spaceById(clubId, spaceId), {
        method: "PATCH",
        body: input,
      });
    },

    archiveSpace(clubId: string, spaceId: string) {
      return client.request<ClubSpace>(ep.spaceById(clubId, spaceId), {
        method: "DELETE",
      });
    },

    listSlots(clubId: string) {
      return client.request<ClubSlotsList>(ep.slots(clubId));
    },

    getSlot(clubId: string, slotId: string) {
      return client.request<ClubSlot>(ep.slotById(clubId, slotId));
    },

    createSlot(clubId: string, input: CreateClubSlotInput) {
      return client.request<ClubSlot>(ep.slots(clubId), {
        method: "POST",
        body: input,
      });
    },

    updateSlot(clubId: string, slotId: string, input: UpdateClubSlotInput) {
      return client.request<ClubSlot>(ep.slotById(clubId, slotId), {
        method: "PATCH",
        body: input,
      });
    },

    archiveSlot(clubId: string, slotId: string) {
      return client.request<ClubSlot>(ep.slotById(clubId, slotId), {
        method: "DELETE",
      });
    },

    cancelOccurrence(
      clubId: string,
      slotId: string,
      input: CancelSlotOccurrenceInput,
    ) {
      return client.request<ClubSlot>(ep.cancelOccurrence(clubId, slotId), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type ClubOwnerClubSlotsApi = ReturnType<
  typeof createClubOwnerClubSlotsApi
>;

/** @deprecated Prefer createClubOwnerClubSlotsApi */
export const createAccountClubSlotsApi = createClubOwnerClubSlotsApi;
export type AccountClubSlotsApi = ClubOwnerClubSlotsApi;
