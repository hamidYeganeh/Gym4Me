import type { SupportTicketStatus } from "@repo/api";

export type SupportTicketsFiltersSectionProps = {
  statusFilter: SupportTicketStatus | "all";
  onStatusChange: (value: SupportTicketStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};

export const SUPPORT_TICKET_STATUS_FILTERS = [
  "all",
  "open",
  "awaiting_admin",
  "awaiting_user",
  "resolved",
  "closed",
] as const;
