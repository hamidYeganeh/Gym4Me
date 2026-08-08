/** Account support tickets (`/account/support`) + public support (`/support`). */
export const accountSupportEndpoints = {
  tickets: "/account/support/tickets",
  ticketById: (id: string) => `/account/support/tickets/${id}`,
  ticketMessages: (id: string) => `/account/support/tickets/${id}/messages`,
  ticketClose: (id: string) => `/account/support/tickets/${id}/close`,
  faq: "/support/faq",
  contact: "/support/contact",
} as const;
