import type { ApiClient } from "../client";
import type { Paginated } from "../types";
import { accountBookingsEndpoints as ep } from "./bookings.endpoint";
import type {
  Booking,
  BookingsListQuery,
  CancelBookingInput,
  CancelBookingSeriesInput,
  CancelBookingSeriesResult,
  CreateBookingInput,
  CreateClubBookingInput,
  CreateClubBookingResult,
  PayBookingResult,
  RescheduleBookingInput,
  VerifyBookingPaymentInput,
} from "./bookings.dto";

const object = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};
const objectId = (value: unknown) => String(object(value)._id ?? object(value).id ?? value ?? "");
const toTomans = (value: unknown) => Number(BigInt(String(value ?? "0")) / BigInt(10));
const internalReturnPath = (value: string) => {
  try {
    const url = new URL(value, "https://gym4me.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/athlete/bookings";
  }
};

function bookingStatus(value: unknown): Booking["status"] {
  if (value === "pending_payment") return "awaiting_payment";
  if (value === "draft") return "pending";
  return String(value ?? "pending") as Booking["status"];
}

/** Normalize the current booking aggregate for screens that still consume the v1 view model. */
export function normalizeBooking(value: unknown): Booking {
  const row = object(value);
  const offering = object(row.offering);
  const offeringProfile = object(offering.profile);
  const branch = object(row.branch);
  const branchProfile = object(branch.profile);
  const club = object(row.club);
  const clubProfile = object(club.profile);
  const firstAllocation = object(Array.isArray(row.allocations) ? row.allocations[0] : null);
  const payment = object(row.payment);
  const pricing = object(row.pricing);
  const type = String(offeringProfile.type ?? "club_session");
  const resourceType: Booking["resource"]["type"] =
    type === "private_coaching" || object(offering.provider).type === "coach"
      ? "coach"
      : type === "group_class"
        ? "class"
        : type === "resource_rental"
          ? "space"
          : "session";
  const startsAt = new Date(firstAllocation.startAt ?? row.createdAt ?? Date.now()).toISOString();
  const endsAt = new Date(firstAllocation.endAt ?? startsAt).toISOString();
  const address = object(branchProfile.address);
  const id = objectId(row);
  return {
    id,
    code: String(row.code ?? id.slice(-6).toUpperCase()),
    status: bookingStatus(row.status),
    paymentExpiresAt: row.status === "pending_payment" ? (row.updatedAt ?? null) : null,
    approvalExpiresAt: null,
    resource: {
      type: resourceType,
      refId: objectId(firstAllocation.resourceId ?? row.offeringId),
      title: String(offeringProfile.name ?? "رزرو ورزشی"),
      coverMediaId: null,
    },
    consultationKind: resourceType === "coach" ? "in_person" : null,
    occurrence: {
      date: startsAt.slice(0, 10),
      startTime: startsAt,
      endTime: endsAt,
    },
    recurringGroupId: row.seriesId ? objectId(row.seriesId) : null,
    attendeeCount: Array.isArray(row.participants) ? row.participants.length : 1,
    startsAt,
    endsAt,
    coach: null,
    athlete: null,
    coachUserId: object(offering.provider).coachUserId
      ? objectId(object(offering.provider).coachUserId)
      : null,
    athleteId: objectId(row.customerUserId),
    slotId: objectId(firstAllocation.resourceId),
    club: {
      id: objectId(club),
      name: String(clubProfile.name ?? branchProfile.name ?? "باشگاه"),
      address: [address.city, address.district].filter(Boolean).join("، ") || null,
    },
    intake: { note: null, medicalConditionKeys: [], supplementKeys: [] },
    pricing: {
      amount: toTomans(pricing.unitAmountMinor),
      discount: toTomans(pricing.discountMinor),
      couponCode: null,
      total: toTomans(pricing.totalMinor),
    },
    payment: payment.id
      ? { refId: objectId(payment.id), paidAt: payment.status === "paid" ? row.updatedAt ?? null : null }
      : null,
    cancellation: null,
    createdAt: String(row.createdAt ?? startsAt),
    updatedAt: String(row.updatedAt ?? row.createdAt ?? startsAt),
  };
}

/** Athlete-side bookings (requires athlete active role). */
export function createAccountBookingsApi(client: ApiClient) {
  return {
    /** Reserve a coach consultation slot. */
    create(input: CreateBookingInput) {
      return client.request<Booking>(ep.root, { method: "POST", body: input });
    },

    /** Reserve club occurrences (session / class / space). */
    createClub(input: CreateClubBookingInput) {
      return client.request<CreateClubBookingResult>(ep.club, {
        method: "POST",
        body: input,
      });
    },

    async list(query: BookingsListQuery = {}) {
      const result = await client.request<Paginated<unknown>>(ep.root, { query });
      return { ...result, result: result.result.map(normalizeBooking) };
    },

    async get(id: string) {
      return normalizeBooking(await client.request<unknown>(ep.byId(id)));
    },

    async cancellationPreview(id: string) {
      const result = object(await client.request<unknown>(ep.cancellationPreview(id)));
      const total = toTomans(result.totalMinor);
      const feeAmount = toTomans(result.penaltyMinor);
      return {
        bookingId: id,
        paid: result.paymentStatus === "paid",
        total,
        feePercent: total > 0 ? Math.round((feeAmount / total) * 100) : 0,
        feeAmount,
        refundAmount: toTomans(result.refundableMinor),
        currency: "IRT" as const,
      };
    },

    async pay(id: string, callbackUrl: string) {
      const result = object(await client.request<unknown>(ep.byId(id)));
      const paymentId = objectId(object(result.payment).id);
      if (!paymentId) throw new Error("Pending payment was not found for this booking.");
      return {
        bookingId: id,
        authority: paymentId,
        redirectUrl: `/athlete/payment/test?paymentId=${encodeURIComponent(paymentId)}&returnPath=${encodeURIComponent(internalReturnPath(callbackUrl))}`,
      } satisfies PayBookingResult;
    },

    async verifyPayment(id: string, _input: VerifyBookingPaymentInput) {
      return normalizeBooking(await client.request<unknown>(ep.byId(id)));
    },

    async reschedule(id: string, input: RescheduleBookingInput) {
      if (!input.startsAt)
        throw new Error("A startsAt value from the availability API is required.");
      const result = await client.request<unknown>(ep.reschedule(id), {
        method: "POST",
        body: { starts_at: input.startsAt, reason: "تغییر زمان توسط ورزشکار" },
        headers: { "idempotency-key": crypto.randomUUID() },
      });
      return normalizeBooking(result);
    },

    async cancel(id: string, input: CancelBookingInput = {}) {
      const result = await client.request<unknown>(ep.cancel(id), {
        method: "POST",
        body: {
          reason: [input.reasonKey, input.note].filter(Boolean).join(": ") || "لغو توسط ورزشکار",
        },
        headers: { "idempotency-key": crypto.randomUUID() },
      });
      return normalizeBooking(result);
    },

    /** Cancel a recurring series from a date. */
    cancelSeries(groupId: string, input: CancelBookingSeriesInput = {}) {
      return client.request<CancelBookingSeriesResult>(
        ep.seriesCancel(groupId),
        { method: "POST", body: input },
      );
    },
  };
}

export type AccountBookingsApi = ReturnType<typeof createAccountBookingsApi>;
