import type { ApiClient } from "../client";
import type {
  ClaimWaitlistInput,
  ExpireWaitlistOffersResult,
  JoinWaitlistInput,
  ListWaitlistsQuery,
  OfferWaitlistInput,
  Waitlist,
  WaitlistsPage,
} from "./waitlist.dto";
import { accountWaitlistEndpoints as ep } from "./waitlist.endpoint";

export function createAccountWaitlistApi(client: ApiClient) {
  return {
    listMine(query: ListWaitlistsQuery = {}) {
      return client.request<WaitlistsPage>(ep.mine, { query });
    },

    join(input: JoinWaitlistInput) {
      return client.request<Waitlist>(ep.join, {
        method: "POST",
        body: input,
      });
    },

    leave(waitlistId: string) {
      return client.request<Waitlist>(ep.leave(waitlistId), {
        method: "POST",
        body: {},
      });
    },

    claim(waitlistId: string, input: ClaimWaitlistInput) {
      return client.request<Waitlist>(ep.claim(waitlistId), {
        method: "POST",
        body: input,
      });
    },

    expireOffers(clubId?: string) {
      return client.request<ExpireWaitlistOffersResult>(ep.expireOffers, {
        method: "POST",
        query: clubId ? { clubId } : undefined,
      });
    },

    listClub(clubId: string, query: ListWaitlistsQuery = {}) {
      return client.request<WaitlistsPage>(ep.club(clubId), { query });
    },

    offer(clubId: string, waitlistId: string, input: OfferWaitlistInput = {}) {
      return client.request<Waitlist>(ep.offer(clubId, waitlistId), {
        method: "POST",
        body: input,
      });
    },
  };
}

export type AccountWaitlistApi = ReturnType<typeof createAccountWaitlistApi>;
