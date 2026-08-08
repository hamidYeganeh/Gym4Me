import type {
  FaqAudience,
  PublishStatus,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@repo/api";

export const TICKET_STATUSES: SupportTicketStatus[] = [
  "open",
  "awaiting_admin",
  "awaiting_user",
  "resolved",
  "closed",
];

export const TICKET_CATEGORIES: SupportTicketCategory[] = [
  "payment",
  "booking",
  "membership",
  "technical",
  "club_complaint",
  "suggestion",
  "complaint",
  "other",
];

export const TICKET_PRIORITIES: SupportTicketPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export const FAQ_AUDIENCES: FaqAudience[] = [
  "all",
  "athlete",
  "coach",
  "club_owner",
];

export const PUBLISH_STATUSES: PublishStatus[] = [
  "draft",
  "published",
  "unpublished",
];

export const TICKET_STATUS_COLOR: Record<
  SupportTicketStatus,
  "warning" | "success" | "danger" | "default" | "accent"
> = {
  open: "warning",
  awaiting_admin: "danger",
  awaiting_user: "accent",
  resolved: "success",
  closed: "default",
};

export const TICKET_PRIORITY_COLOR: Record<
  SupportTicketPriority,
  "warning" | "success" | "danger" | "default" | "accent"
> = {
  low: "default",
  normal: "accent",
  high: "warning",
  urgent: "danger",
};
