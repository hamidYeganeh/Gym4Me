"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "../../core/provider";
import { commerceApi } from "./api";
import { commerceKeys } from "./queries";
import type {
  CancellationPolicyInput,
  CheckoutPaymentMethod,
  StaffBookingInput,
  StaffCancellationInput,
  QuoteInput,
} from "./types";

const key = () => globalThis.crypto?.randomUUID?.() ?? `gym4me-${Date.now()}-${Math.random()}`;

export function useCreateQuoteMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey = key(),
    }: {
      input: QuoteInput;
      idempotencyKey?: string;
    }) => commerceApi.createQuote(client, input, idempotencyKey),
  });
}
export function useCreateHoldMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: ({
      quoteId,
      idempotencyKey = key(),
    }: {
      quoteId: string;
      idempotencyKey?: string;
    }) => commerceApi.createHold(client, quoteId, idempotencyKey),
  });
}
export function useCheckoutMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      holdToken,
      paymentMethod,
      membershipContractId,
      idempotencyKey = key(),
    }: {
      holdToken: string;
      paymentMethod: CheckoutPaymentMethod;
      membershipContractId?: string;
      idempotencyKey?: string;
    }) =>
      commerceApi.checkout(client, holdToken, paymentMethod, idempotencyKey, membershipContractId),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["commerce", "bookings"] });
      void cache.invalidateQueries({ queryKey: commerceKeys.wallet });
      void cache.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}
export function useCancelBookingMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
      idempotencyKey = key(),
    }: {
      bookingId: string;
      reason: string;
      idempotencyKey?: string;
    }) => commerceApi.cancel(client, bookingId, reason, idempotencyKey),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.all }),
  });
}
export function useAdminCancelBookingMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
      idempotencyKey = key(),
    }: {
      bookingId: string;
      reason: string;
      idempotencyKey?: string;
    }) => commerceApi.adminCancel(client, bookingId, reason, idempotencyKey),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["commerce", "bookings", "admin"] }),
  });
}
export function useUpdateHouseholdMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => commerceApi.updateHousehold(client, name),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.household }),
  });
}
export function useAddHouseholdMemberMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      user_id?: string;
      profile: {
        full_name: string;
        relation?: string;
        birth_date?: string;
        gender?: string;
        mobile?: string;
      };
    }) => commerceApi.addHouseholdMember(client, input),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.household }),
  });
}
export function useRemoveHouseholdMemberMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => commerceApi.removeHouseholdMember(client, memberId),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.household }),
  });
}
export function useCreateTopUpMutation() {
  const client = useApiClient();
  return useMutation({
    mutationFn: ({
      amountMinor,
      idempotencyKey = key(),
    }: {
      amountMinor: string;
      idempotencyKey?: string;
    }) => commerceApi.createTopUp(client, amountMinor, idempotencyKey),
  });
}
export function useMockPaymentDecisionMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      decision,
      idempotencyKey = key(),
    }: {
      paymentId: string;
      decision: "approve" | "cancel";
      idempotencyKey?: string;
    }) => commerceApi.decideMockPayment(client, paymentId, decision, idempotencyKey),
    onSuccess: (_, variables) => {
      void cache.invalidateQueries({ queryKey: commerceKeys.payment(variables.paymentId) });
      void cache.invalidateQueries({ queryKey: commerceKeys.all });
    },
  });
}
export function useCreateCancellationPolicyMutation(
  scope: "organizations" | "clubs",
  scopeId: string,
) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: CancellationPolicyInput) =>
      commerceApi.createCancellationPolicy(client, scope, scopeId, input),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: commerceKeys.cancellationPolicies(scope, scopeId) }),
  });
}
export function useUpdateCancellationPolicyMutation(
  scope: "organizations" | "clubs",
  scopeId: string,
) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ policyId, input }: { policyId: string; input: CancellationPolicyInput }) =>
      commerceApi.updateCancellationPolicy(client, policyId, input),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: commerceKeys.cancellationPolicies(scope, scopeId) }),
  });
}
export function useArchiveCancellationPolicyMutation(
  scope: "organizations" | "clubs",
  scopeId: string,
) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) => commerceApi.archiveCancellationPolicy(client, policyId),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: commerceKeys.cancellationPolicies(scope, scopeId) }),
  });
}
export function useIssueAccessPassesMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      participantIndexes,
    }: {
      bookingId: string;
      participantIndexes?: number[];
    }) => commerceApi.issueAccessPasses(client, bookingId, participantIndexes),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["commerce", "bookings"] }),
  });
}
export function useCheckInMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, token }: { branchId: string; token: string }) =>
      commerceApi.checkIn(client, branchId, token),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["commerce", "bookings"] }),
  });
}
export function useCheckOutMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchId,
      checkInId,
      note,
    }: {
      branchId: string;
      checkInId: string;
      note?: string;
    }) => commerceApi.checkOut(client, branchId, checkInId, note),
    onSuccess: () => void cache.invalidateQueries({ queryKey: ["commerce", "bookings"] }),
  });
}
export function useJoinWaitlistMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      offering_id: string;
      branch_id: string;
      starts_at: string;
      participants: number;
    }) => commerceApi.joinWaitlist(client, input),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.waitlist }),
  });
}
export function useLeaveWaitlistMutation() {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => commerceApi.leaveWaitlist(client, entryId),
    onSuccess: () => void cache.invalidateQueries({ queryKey: commerceKeys.waitlist }),
  });
}
export function useStaffCreateBookingMutation(branchId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey = key(),
    }: {
      input: StaffBookingInput;
      idempotencyKey?: string;
    }) => commerceApi.staffCreateBooking(client, branchId, input, idempotencyKey),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: ["commerce", "bookings", `branch:${branchId}`] }),
  });
}
export function useStaffRescheduleBookingMutation(branchId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      startsAt,
      reason,
      idempotencyKey = key(),
    }: {
      bookingId: string;
      startsAt: string;
      reason: string;
      idempotencyKey?: string;
    }) =>
      commerceApi.staffRescheduleBooking(
        client,
        branchId,
        bookingId,
        startsAt,
        reason,
        idempotencyKey,
      ),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: ["commerce", "bookings", `branch:${branchId}`] }),
  });
}
export function useStaffCancelBookingMutation(branchId: string) {
  const client = useApiClient();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      input,
      idempotencyKey = key(),
    }: {
      bookingId: string;
      input: StaffCancellationInput;
      idempotencyKey?: string;
    }) => commerceApi.staffCancelBooking(client, branchId, bookingId, input, idempotencyKey),
    onSuccess: () =>
      void cache.invalidateQueries({ queryKey: ["commerce", "bookings", `branch:${branchId}`] }),
  });
}
