import type {
  ListMySupportTicketsQuery,
  ListPublicFaqQuery,
} from "./support.dto";

export const accountSupportKeys = {
  all: ["account", "support"] as const,
  tickets: () => [...accountSupportKeys.all, "tickets"] as const,
  ticketList: (query: ListMySupportTicketsQuery = {}) =>
    [...accountSupportKeys.tickets(), "list", query] as const,
  ticketDetail: (id: string) =>
    [...accountSupportKeys.tickets(), "detail", id] as const,
  faq: (query: ListPublicFaqQuery = {}) =>
    [...accountSupportKeys.all, "faq", query] as const,
  contact: () => [...accountSupportKeys.all, "contact"] as const,
};
