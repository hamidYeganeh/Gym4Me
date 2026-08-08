/** Admin support (`/admin/support`). */
export const adminSupportEndpoints = {
  tickets: "/admin/support/tickets",
  ticketById: (id: string) => `/admin/support/tickets/${id}`,
  ticketMessages: (id: string) => `/admin/support/tickets/${id}/messages`,
  ticketAssign: (id: string) => `/admin/support/tickets/${id}/assign`,
  faq: "/admin/support/faq",
  faqById: (id: string) => `/admin/support/faq/${id}`,
} as const;
