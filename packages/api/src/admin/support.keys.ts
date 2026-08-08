import type {
  ListAdminFaqQuery,
  ListAdminSupportTicketsQuery,
} from "./support.dto";

export const adminSupportKeys = {
  all: ["admin", "support"] as const,
  tickets: () => [...adminSupportKeys.all, "tickets"] as const,
  ticketList: (query: ListAdminSupportTicketsQuery = {}) =>
    [...adminSupportKeys.tickets(), "list", query] as const,
  ticketDetail: (id: string) =>
    [...adminSupportKeys.tickets(), "detail", id] as const,
  faqs: () => [...adminSupportKeys.all, "faq"] as const,
  faqList: (query: ListAdminFaqQuery = {}) =>
    [...adminSupportKeys.faqs(), "list", query] as const,
};
