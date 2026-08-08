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
  createAccountSupportApi,
  type AccountSupportApi,
} from "./support.client";
import type {
  CreateSupportTicketInput,
  ListMySupportTicketsQuery,
  ListPublicFaqQuery,
  PublicFaqItem,
  ReplySupportTicketInput,
  SupportContact,
  SupportTicket,
  SupportTicketDetail,
} from "./support.dto";
import { accountSupportKeys } from "./support.keys";

function useAccountSupportApi(): AccountSupportApi {
  const client = useApiClient();
  return useMemo(() => createAccountSupportApi(client), [client]);
}

export function useMySupportTickets(
  query: ListMySupportTicketsQuery = {},
  options?: Omit<
    UseQueryOptions<Paginated<SupportTicket>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSupportApi();
  return useQuery({
    queryKey: accountSupportKeys.ticketList(query),
    queryFn: () => api.listTickets(query),
    ...options,
  });
}

export function useMySupportTicket(
  id: string,
  options?: Omit<
    UseQueryOptions<SupportTicketDetail, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const api = useAccountSupportApi();
  return useQuery({
    queryKey: accountSupportKeys.ticketDetail(id),
    queryFn: () => api.getTicket(id),
    ...options,
  });
}

export function useCreateSupportTicket(
  options?: UseMutationOptions<
    SupportTicketDetail,
    Error,
    CreateSupportTicketInput
  >,
) {
  const api = useAccountSupportApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: (input) => api.createTicket(input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountSupportKeys.tickets(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useReplySupportTicket(
  options?: UseMutationOptions<
    SupportTicketDetail,
    Error,
    { id: string; input: ReplySupportTicketInput }
  >,
) {
  const api = useAccountSupportApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id, input }) => api.reply(id, input),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountSupportKeys.tickets(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function useCloseSupportTicket(
  options?: UseMutationOptions<SupportTicketDetail, Error, { id: string }>,
) {
  const api = useAccountSupportApi();
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ id }) => api.closeTicket(id),
    onSuccess: (data, vars, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: accountSupportKeys.tickets(),
      });
      onSuccess?.(data, vars, onMutateResult, context);
    },
  });
}

export function usePublicFaq(
  query: ListPublicFaqQuery = {},
  options?: Omit<UseQueryOptions<PublicFaqItem[], Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountSupportApi();
  return useQuery({
    queryKey: accountSupportKeys.faq(query),
    queryFn: () => api.listFaq(query),
    ...options,
  });
}

export function useSupportContact(
  options?: Omit<UseQueryOptions<SupportContact, Error>, "queryKey" | "queryFn">,
) {
  const api = useAccountSupportApi();
  return useQuery({
    queryKey: accountSupportKeys.contact(),
    queryFn: () => api.contact(),
    ...options,
  });
}
