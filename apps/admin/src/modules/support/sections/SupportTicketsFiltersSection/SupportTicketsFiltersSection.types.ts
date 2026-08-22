import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";

export type SupportTicketsFiltersSectionProps = {
  statusFilter: SupportTicketStatus | "all";
  categoryFilter: SupportTicketCategory | "all";
  priorityFilter: SupportTicketPriority | "all";
  onStatusChange: (value: SupportTicketStatus | "all") => void;
  onCategoryChange: (value: SupportTicketCategory | "all") => void;
  onPriorityChange: (value: SupportTicketPriority | "all") => void;
  onRefresh: () => void;
  className?: string;
};
