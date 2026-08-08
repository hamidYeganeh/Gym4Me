import type { ApiClient } from "../client";
import type { Paginated } from "../types";
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
import { adminSupportEndpoints as ep } from "./support.endpoint";

/** Admin support tickets + FAQ management. */
export function createAdminSupportApi(client: ApiClient) {
  return {
    listTickets(query: ListAdminSupportTicketsQuery = {}) {
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

    assignToMe(id: string) {
      return client.request<SupportTicketDetail>(ep.ticketAssign(id), {
        method: "PATCH",
      });
    },

    updateTicket(id: string, input: AdminUpdateTicketInput) {
      return client.request<SupportTicketDetail>(ep.ticketById(id), {
        method: "PATCH",
        body: input,
      });
    },

    listFaq(query: ListAdminFaqQuery = {}) {
      return client.request<Paginated<AdminFaqItem>>(ep.faq, { query });
    },

    createFaq(input: CreateFaqInput) {
      return client.request<AdminFaqItem>(ep.faq, {
        method: "POST",
        body: input,
      });
    },

    updateFaq(id: string, input: UpdateFaqInput) {
      return client.request<AdminFaqItem>(ep.faqById(id), {
        method: "PATCH",
        body: input,
      });
    },

    deleteFaq(id: string) {
      return client.request<{ deleted: boolean }>(ep.faqById(id), {
        method: "DELETE",
      });
    },
  };
}

export type AdminSupportApi = ReturnType<typeof createAdminSupportApi>;
