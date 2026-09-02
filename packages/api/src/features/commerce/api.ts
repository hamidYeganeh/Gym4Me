import type { ApiMeta } from "../../core/contracts";
import type { ApiClient } from "../../core/client";
import type { QueryParams } from "../../core/query-string";
import type { PaginationMeta } from "../organizations/types";
import type {
  Booking,
  BookingHold,
  BookingList,
  BookingListParams,
  CancellationPolicy,
  CancellationPolicyInput,
  CancellationPreview,
  CheckIn,
  CheckoutResult,
  Household,
  IssuedAccessPass,
  MockGatewayResult,
  Payment,
  PricingQuote,
  QuoteInput,
  StaffBookingInput,
  StaffCancellationInput,
  WaitlistEntry,
  WalletSummary,
} from "./types";

const segment = encodeURIComponent;
const mutationOptions = (idempotencyKey: string) => ({ idempotencyKey });

async function bookingsList(
  client: ApiClient,
  path: string,
  params: BookingListParams,
  signal?: AbortSignal,
): Promise<BookingList> {
  const response = await client.get<Booking[]>(path, {
    query: params as QueryParams,
    ...(signal ? { signal } : {}),
  });
  const pagination = (response.meta as ApiMeta & { pagination?: PaginationMeta }).pagination ?? {
    page: 1,
    limit: 20,
    total: response.data.length,
    pages: response.data.length ? 1 : 0,
  };
  return { items: response.data, meta: response.meta, pagination };
}

export const commerceApi = {
  createQuote: async (client: ApiClient, input: QuoteInput, idempotencyKey: string) =>
    (
      await client.post<PricingQuote, QuoteInput>(
        "/bookings/quotes",
        input,
        mutationOptions(idempotencyKey),
      )
    ).data,
  quote: async (client: ApiClient, quoteId: string, signal?: AbortSignal) =>
    (
      await client.get<PricingQuote>(
        `/bookings/quotes/${segment(quoteId)}`,
        signal ? { signal } : undefined,
      )
    ).data,
  createHold: async (client: ApiClient, quoteId: string, idempotencyKey: string) =>
    (
      await client.post<{ hold: BookingHold; holdToken: string }, { quote_id: string }>(
        "/bookings/holds",
        { quote_id: quoteId },
        mutationOptions(idempotencyKey),
      )
    ).data,
  checkout: async (
    client: ApiClient,
    holdToken: string,
    paymentMethod: "wallet" | "sandbox_gateway" | "membership",
    idempotencyKey: string,
    membershipContractId?: string,
  ) =>
    (
      await client.post<
        CheckoutResult,
        {
          hold_token: string;
          payment_method: "wallet" | "sandbox_gateway" | "membership";
          membership_contract_id?: string;
        }
      >(
        "/bookings/checkout",
        {
          hold_token: holdToken,
          payment_method: paymentMethod,
          ...(membershipContractId ? { membership_contract_id: membershipContractId } : {}),
        },
        mutationOptions(idempotencyKey),
      )
    ).data,
  mine: (client: ApiClient, params: BookingListParams = {}, signal?: AbortSignal) =>
    bookingsList(client, "/bookings/me", params, signal),
  branch: (
    client: ApiClient,
    branchId: string,
    params: BookingListParams = {},
    signal?: AbortSignal,
  ) => bookingsList(client, `/branches/${segment(branchId)}/bookings`, params, signal),
  admin: (client: ApiClient, params: BookingListParams = {}, signal?: AbortSignal) =>
    bookingsList(client, "/admin/bookings", params, signal),
  cancel: async (client: ApiClient, bookingId: string, reason: string, idempotencyKey: string) =>
    (
      await client.post<Booking, { reason: string }>(
        `/bookings/${segment(bookingId)}/cancel`,
        { reason },
        mutationOptions(idempotencyKey),
      )
    ).data,
  reschedule: async (
    client: ApiClient,
    bookingId: string,
    startsAt: string,
    reason: string,
    idempotencyKey: string,
  ) =>
    (
      await client.post<Booking, { starts_at: string; reason: string }>(
        `/bookings/${segment(bookingId)}/reschedule`,
        { starts_at: startsAt, reason },
        mutationOptions(idempotencyKey),
      )
    ).data,
  cancellationPreview: async (client: ApiClient, bookingId: string, signal?: AbortSignal) =>
    (
      await client.get<CancellationPreview>(
        `/bookings/${segment(bookingId)}/cancellation-preview`,
        signal ? { signal } : undefined,
      )
    ).data,
  adminCancel: async (
    client: ApiClient,
    bookingId: string,
    reason: string,
    idempotencyKey: string,
  ) =>
    (
      await client.post<Booking, { reason: string }>(
        `/admin/bookings/${segment(bookingId)}/cancel`,
        { reason },
        mutationOptions(idempotencyKey),
      )
    ).data,
  household: async (client: ApiClient, signal?: AbortSignal) =>
    (await client.get<Household>("/bookings/household", signal ? { signal } : undefined)).data,
  updateHousehold: async (client: ApiClient, name: string) =>
    (
      await client.patch<Household, { profile: { name: string } }>("/bookings/household", {
        profile: { name },
      })
    ).data,
  addHouseholdMember: async (
    client: ApiClient,
    input: {
      user_id?: string;
      profile: {
        full_name: string;
        relation?: string;
        birth_date?: string;
        gender?: string;
        mobile?: string;
      };
    },
  ) => (await client.post<Household, typeof input>("/bookings/household/members", input)).data,
  removeHouseholdMember: async (client: ApiClient, memberId: string) =>
    (await client.delete<Household>(`/bookings/household/members/${segment(memberId)}`)).data,
  wallet: async (client: ApiClient, signal?: AbortSignal) =>
    (await client.get<WalletSummary>("/finance/wallet/me", signal ? { signal } : undefined)).data,
  payments: async (client: ApiClient, signal?: AbortSignal) =>
    (await client.get<Payment[]>("/finance/payments/me", signal ? { signal } : undefined)).data,
  invoices: async (client: ApiClient, signal?: AbortSignal) =>
    (
      await client.get<Record<string, any>[]>(
        "/finance/invoices/me",
        signal ? { signal } : undefined,
      )
    ).data,
  refunds: async (client: ApiClient, signal?: AbortSignal) =>
    (
      await client.get<Record<string, any>[]>(
        "/finance/refunds/me",
        signal ? { signal } : undefined,
      )
    ).data,
  createTopUp: async (client: ApiClient, amountMinor: string, idempotencyKey: string) =>
    (
      await client.post<Payment, { amount_minor: string; currency: string }>(
        "/finance/wallet/me/top-ups",
        { amount_minor: amountMinor, currency: "IRR" },
        mutationOptions(idempotencyKey),
      )
    ).data,
  mockPayment: async (client: ApiClient, paymentId: string, signal?: AbortSignal) =>
    (
      await client.get<Payment>(
        `/finance/mock-gateway/payments/${segment(paymentId)}`,
        signal ? { signal } : undefined,
      )
    ).data,
  decideMockPayment: async (
    client: ApiClient,
    paymentId: string,
    decision: "approve" | "cancel",
    idempotencyKey: string,
  ) =>
    (
      await client.post<MockGatewayResult, { decision: typeof decision }>(
        `/finance/mock-gateway/payments/${segment(paymentId)}/decision`,
        { decision },
        mutationOptions(idempotencyKey),
      )
    ).data,
  cancellationPolicies: async (
    client: ApiClient,
    scope: "organizations" | "clubs",
    scopeId: string,
    signal?: AbortSignal,
  ) =>
    (
      await client.get<CancellationPolicy[]>(
        `/${scope}/${segment(scopeId)}/cancellation-policies`,
        signal ? { signal } : undefined,
      )
    ).data,
  createCancellationPolicy: async (
    client: ApiClient,
    scope: "organizations" | "clubs",
    scopeId: string,
    input: CancellationPolicyInput,
  ) =>
    (
      await client.post<CancellationPolicy, CancellationPolicyInput>(
        `/${scope}/${segment(scopeId)}/cancellation-policies`,
        input,
      )
    ).data,
  updateCancellationPolicy: async (
    client: ApiClient,
    policyId: string,
    input: CancellationPolicyInput,
  ) =>
    (
      await client.patch<CancellationPolicy, CancellationPolicyInput>(
        `/cancellation-policies/${segment(policyId)}`,
        input,
      )
    ).data,
  archiveCancellationPolicy: async (client: ApiClient, policyId: string) =>
    (await client.delete<CancellationPolicy>(`/cancellation-policies/${segment(policyId)}`)).data,
  issueAccessPasses: async (client: ApiClient, bookingId: string, participantIndexes?: number[]) =>
    (
      await client.post<IssuedAccessPass[], { participant_indexes?: number[] }>(
        `/bookings/${segment(bookingId)}/access-passes`,
        participantIndexes ? { participant_indexes: participantIndexes } : {},
      )
    ).data,
  checkIn: async (client: ApiClient, branchId: string, token: string) =>
    (
      await client.post<{ booking: Booking; checkIn: CheckIn }, { token: string }>(
        `/branches/${segment(branchId)}/access/check-ins`,
        { token },
      )
    ).data,
  checkOut: async (client: ApiClient, branchId: string, checkInId: string, note?: string) =>
    (
      await client.post<CheckIn, { note?: string }>(
        `/branches/${segment(branchId)}/access/check-outs/${segment(checkInId)}`,
        note ? { note } : {},
      )
    ).data,
  joinWaitlist: async (
    client: ApiClient,
    input: { offering_id: string; branch_id: string; starts_at: string; participants: number },
  ) => (await client.post<WaitlistEntry, typeof input>("/bookings/waitlist", input)).data,
  waitlist: async (client: ApiClient, signal?: AbortSignal) =>
    (await client.get<WaitlistEntry[]>("/bookings/waitlist/me", signal ? { signal } : undefined))
      .data,
  leaveWaitlist: async (client: ApiClient, entryId: string) =>
    (await client.delete<WaitlistEntry>(`/bookings/waitlist/${segment(entryId)}`)).data,
  staffCreateBooking: async (
    client: ApiClient,
    branchId: string,
    input: StaffBookingInput,
    idempotencyKey: string,
  ) =>
    (
      await client.post<Booking, StaffBookingInput>(
        `/branches/${segment(branchId)}/bookings`,
        input,
        mutationOptions(idempotencyKey),
      )
    ).data,
  staffRescheduleBooking: async (
    client: ApiClient,
    branchId: string,
    bookingId: string,
    startsAt: string,
    reason: string,
    idempotencyKey: string,
  ) =>
    (
      await client.post<Booking, { starts_at: string; reason: string }>(
        `/branches/${segment(branchId)}/bookings/${segment(bookingId)}/reschedule`,
        { starts_at: startsAt, reason },
        mutationOptions(idempotencyKey),
      )
    ).data,
  staffCancelBooking: async (
    client: ApiClient,
    branchId: string,
    bookingId: string,
    input: StaffCancellationInput,
    idempotencyKey: string,
  ) =>
    (
      await client.post<Booking, StaffCancellationInput>(
        `/branches/${segment(branchId)}/bookings/${segment(bookingId)}/cancel`,
        input,
        mutationOptions(idempotencyKey),
      )
    ).data,
};
