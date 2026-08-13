import type { ApiClient } from "../client";
import type {
  CalendarBlock,
  CalendarBlocksPage,
  ListCalendarBlocksQuery,
  UpsertCalendarBlockInput,
} from "./calendar.dto";
import { accountCalendarEndpoints as ep } from "./calendar.endpoint";

export function createAccountCalendarApi(client: ApiClient) {
  return {
    listClubBlocks(clubId: string, query: ListCalendarBlocksQuery = {}) {
      return client.request<CalendarBlocksPage>(ep.clubBlocks(clubId), {
        query,
      });
    },

    upsertClubBlock(clubId: string, input: UpsertCalendarBlockInput) {
      return client.request<CalendarBlock>(ep.clubBlocks(clubId), {
        method: "POST",
        body: input,
      });
    },

    removeClubBlock(clubId: string, blockId: string) {
      return client.request<CalendarBlock>(ep.clubBlock(clubId, blockId), {
        method: "DELETE",
      });
    },

    listCoachBlocks(query: ListCalendarBlocksQuery = {}) {
      return client.request<CalendarBlocksPage>(ep.coachBlocks, { query });
    },

    upsertCoachBlock(input: UpsertCalendarBlockInput) {
      return client.request<CalendarBlock>(ep.coachBlocks, {
        method: "POST",
        body: input,
      });
    },

    removeCoachBlock(blockId: string) {
      return client.request<CalendarBlock>(ep.coachBlock(blockId), {
        method: "DELETE",
      });
    },
  };
}

export type AccountCalendarApi = ReturnType<typeof createAccountCalendarApi>;
