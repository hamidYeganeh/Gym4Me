import type { ApiClient } from "../client";
import type { ItemsResponse } from "../types";
import type {
  ClubCalendarQuery,
  ClubCalendarResponse,
  ClubClass,
  ClubSlot,
  ClubSpace,
} from "./club-slots.dto";
import { discoveryClubSlotsEndpoints as ep } from "./club-slots.endpoint";

/** Public discovery calendar, classes & slots. */
export function createDiscoveryClubSlotsApi(client: ApiClient) {
  return {
    getCalendar(clubId: string, query: ClubCalendarQuery) {
      return client.request<ClubCalendarResponse>(ep.calendar(clubId), {
        query,
        public: true,
      });
    },

    listClasses(clubId: string) {
      return client.request<ItemsResponse<ClubClass>>(ep.classes(clubId), {
        public: true,
      });
    },

    getClass(clubId: string, classId: string) {
      return client.request<ClubClass>(ep.classById(clubId, classId), {
        public: true,
      });
    },

    listSpaces(clubId: string) {
      return client.request<ItemsResponse<ClubSpace>>(ep.spaces(clubId), {
        public: true,
      });
    },

    getSpace(clubId: string, spaceId: string) {
      return client.request<ClubSpace>(ep.spaceById(clubId, spaceId), {
        public: true,
      });
    },

    listSlots(clubId: string) {
      return client.request<ItemsResponse<ClubSlot>>(ep.slots(clubId), {
        public: true,
      });
    },

    getSlot(clubId: string, slotId: string) {
      return client.request<ClubSlot>(ep.slotById(clubId, slotId), {
        public: true,
      });
    },
  };
}

export type DiscoveryClubSlotsApi = ReturnType<
  typeof createDiscoveryClubSlotsApi
>;
