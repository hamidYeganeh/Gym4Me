import type { ApiClient } from "../client";
import { coachSlotsEndpoints as ep } from "./coach-slots.endpoint";
import type {
  CoachSlotClub,
  CoachSlotsListResponse,
  CoachSlotsRangeQuery,
  CreateCoachSlotsInput,
} from "./coach-slots.dto";

/** Coach availability management (requires coach active role). */
export function createCoachSlotsApi(client: ApiClient) {
  return {
    list(query: CoachSlotsRangeQuery) {
      return client.request<CoachSlotsListResponse>(ep.root, { query });
    },

    /** Clubs the coach can attach in-person slots to. */
    clubs() {
      return client.request<CoachSlotClub[]>(ep.clubs);
    },

    create(input: CreateCoachSlotsInput) {
      return client.request<CoachSlotsListResponse>(ep.root, {
        method: "POST",
        body: input,
      });
    },

    remove(slotId: string) {
      return client.request<{ deleted: boolean }>(ep.byId(slotId), {
        method: "DELETE",
      });
    },
  };
}

export type CoachSlotsApi = ReturnType<typeof createCoachSlotsApi>;
