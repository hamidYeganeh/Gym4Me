import type { ApiClient } from "../client";
import type { Paginated } from "../types";
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
import { accountSupportEndpoints as ep } from "./support.endpoint";

/** Account support tickets + public FAQ / contact. */
export function createAccountSupportApi(client: ApiClient) {
  return {
    createTicket(input: CreateSupportTicketInput) {
      return client.request<SupportTicketDetail>(ep.tickets, {
        method: "POST",
        body: input,
      });
    },

    listTickets(query: ListMySupportTicketsQuery = {}) {
      return client.request<Paginated<SupportTicket>>(ep.tickets, { query });
    },

    getTicket(id: string) {
      return client.request<SupportTicketDetail>(ep.ticketById(id));
    },

    reply(id: string, input: ReplySupportTicketInput) {
      return client.request<SupportTicketDetail>(ep.ticketMessages(id), {
        method: "POST",
        body: input,
      });
    },

    closeTicket(id: string) {
      return client.request<SupportTicketDetail>(ep.ticketClose(id), {
        method: "PATCH",
      });
    },

    listFaq(query: ListPublicFaqQuery = {}) {
      return client.request<PublicFaqItem[]>(ep.faq, { query });
    },

    contact() {
      return client.request<SupportContact>(ep.contact);
    },
  };
}

export type AccountSupportApi = ReturnType<typeof createAccountSupportApi>;
