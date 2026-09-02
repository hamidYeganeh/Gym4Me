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
import type { CreateClubBookingResult } from "../booking/bookings.dto";
import { normalizeBooking } from "../booking/bookings.client";
import { accountWaitlistEndpoints as ep } from "./waitlist.endpoint";

function asLegacyWaitlist(item: any): Waitlist {
  const id = String(item.id ?? item._id ?? "");
  const startsAt = item.request?.startsAt ?? item.request?.starts_at ?? null;
  return {
    id,
    resource: {
      type: "class",
      id: String(item.offeringId ?? item.offering_id ?? ""),
    },
    clubId: item.branchId ? String(item.branchId) : (item.branch_id ?? null),
    occurrenceDate: startsAt ? String(startsAt) : null,
    entries: [
      {
        id,
        userId: String(item.customerUserId ?? item.customer_user_id ?? ""),
        priority: Number(item.priority ?? 0),
        status: item.status ?? "waiting",
        offeredAt: item.notification?.offeredAt ?? null,
        offerExpiresAt: item.notification?.expiresAt ?? null,
        joinedAt: String(item.createdAt ?? new Date(0).toISOString()),
      },
    ],
    entryCount: 1,
    createdAt: String(item.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(item.updatedAt ?? item.createdAt ?? new Date(0).toISOString()),
  };
}

export function createAccountWaitlistApi(client: ApiClient) {
  return {
    async listMine(query: ListWaitlistsQuery = {}) {
      const response = await client.request<any>(ep.mine, { query });
      const items = Array.isArray(response) ? response : (response.result ?? []);
      const page = Number(query.page ?? 1);
      const pageSize = Number(query.page_size ?? Math.max(items.length, 1));
      return {
        result: items.map(asLegacyWaitlist),
        pagination: {
          page,
          page_size: pageSize,
          count: items.length,
          total: items.length,
          prev: null,
          next: null,
        },
      } satisfies WaitlistsPage;
    },

    async join(input: JoinWaitlistInput) {
      if (!input.clubId || !input.occurrenceDate)
        throw new Error("Waitlist requires a branch and occurrence date.");
      const result = await client.request<any>(ep.join, {
        method: "POST",
        body: {
          offering_id: input.resource.id,
          branch_id: input.clubId,
          starts_at: input.occurrenceDate,
          participants: 1,
        },
      });
      return asLegacyWaitlist(result);
    },

    async leave(waitlistId: string) {
      const result = await client.request<any>(`/bookings/waitlist/${waitlistId}`, {
        method: "DELETE",
      });
      return asLegacyWaitlist(result);
    },

    async claim(waitlistId: string, input: ClaimWaitlistInput) {
      void input;
      const result = await client.request<any>(`/bookings/waitlist/${waitlistId}/claim`, {
        method: "POST",
        body: {},
        headers: { "idempotency-key": crypto.randomUUID() },
      });
      return {
        recurringGroupId: result.series ? String(result.series._id ?? result.series.id) : null,
        bookings: (result.bookings ?? []).map(normalizeBooking),
      } satisfies CreateClubBookingResult;
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
