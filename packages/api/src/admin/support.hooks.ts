import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiClient } from "../react";
import type { Paginated } from "../types";
import {
  createAdminSupportApi,
  type AdminSupportApi,
} from "./support.client";
import type {
  AdminFaqItem,
  AdminUpdateTicketInput,
  CreateFaqInput,
  ListAdminFaqQuery,
  ListAdminSupportTicketsQuery,
  ReplySupportTicketInput,
  SupportTicket,
  SupportTicketDetail,
  UpdateFaqInput,
} from "./support.dto";
import { adminSupportKeys } from "./support.keys";

function useAdminSupportApi(): AdminSupportApi {
  const client = useApiClient();
  return useMemo(() => createAdminSupportApi(client), [client]);
}

export function useAdminSupportTickets(
  query: ListAdminSupportTicketsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<SupportTicket>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminSupportApi();
  return useQuery({
    queryKey: adminSupportKeys.ticketList(query),
    queryFn: () => api.listTickets(query),
    ...options,
  });
}

export function useAdminSupportTicket(
  id: string,
  options?: Omit<
    UseQueryOptions<SupportTicketDetail, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminSupportApi();
  return useQuery({
    queryKey: adminSupportKeys.ticketDetail(id),
    queryFn: () => api.getTicket(id),
    ...options,
  });
}

function useInvalidateTickets() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({
      queryKey: adminSupportKeys.tickets(),
    });
}

export function useReplyAdminSupportTicket(
  options?: UseMutationOptions<
    SupportTicketDetail,
    Error,
    { id: string; input: ReplySupportTicketInput }
  >,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateTickets();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.reply(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAssignAdminSupportTicket(
  options?: UseMutationOptions<SupportTicketDetail, Error, { id: string }>,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateTickets();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.assignToMe(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminSupportTicket(
  options?: UseMutationOptions<
    SupportTicketDetail,
    Error,
    { id: string; input: AdminUpdateTicketInput }
  >,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateTickets();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateTicket(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useAdminFaqList(
  query: ListAdminFaqQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<AdminFaqItem>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAdminSupportApi();
  return useQuery({
    queryKey: adminSupportKeys.faqList(query),
    queryFn: () => api.listFaq(query),
    ...options,
  });
}

function useInvalidateFaq() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: adminSupportKeys.faqs() });
}

export function useCreateAdminFaq(
  options?: UseMutationOptions<AdminFaqItem, Error, CreateFaqInput>,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateFaq();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createFaq(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useUpdateAdminFaq(
  options?: UseMutationOptions<
    AdminFaqItem,
    Error,
    { id: string; input: UpdateFaqInput }
  >,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateFaq();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.updateFaq(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useDeleteAdminFaq(
  options?: UseMutationOptions<{ deleted: boolean }, Error, { id: string }>,
) {
  const api = useAdminSupportApi();
  const invalidate = useInvalidateFaq();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.deleteFaq(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      invalidate();
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}
