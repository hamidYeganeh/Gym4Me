import type { ApiClient } from "../client";
import type { ItemsResponse } from "../types";
import type {
  ClubCalendarQuery,
  ClubCalendarResponse,
  ClubClass,
} from "./club-slots.dto";
import { discoveryClubSlotsEndpoints as ep } from "./club-slots.endpoint";

/** Public discovery calendar & classes. */
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
  };
}

export type DiscoveryClubSlotsApi = ReturnType<
  typeof createDiscoveryClubSlotsApi
>;
