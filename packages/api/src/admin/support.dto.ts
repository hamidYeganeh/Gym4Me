import type {
  FaqAudience,
  ListQuery,
  ListQueryFilter,
  PublishStatus,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "../types";

export type {
  ReplySupportTicketInput,
  SupportTicket,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportUserSummary,
} from "../account/support.dto";

export type AdminSupportTicketsSortBy =
  | "ticketNumber"
  | "subject"
  | "status"
  | "category"
  | "priority"
  | "lastMessageAt"
  | "messageCount"
  | "createdAt"
  | "updatedAt";

export type ListAdminSupportTicketsQuery =
  ListQuery<AdminSupportTicketsSortBy> & {
    status?: ListQueryFilter<SupportTicketStatus>;
    category?: ListQueryFilter<SupportTicketCategory>;
    priority?: ListQueryFilter<SupportTicketPriority>;
  };

export type AdminUpdateTicketInput = {
  priority?: SupportTicketPriority;
  status?: SupportTicketStatus;
  resolutionNote?: string;
};

export type AdminFaqItem = {
  id: string;
  question: string;
  answer: string;
  audience: FaqAudience;
  publishStatus: PublishStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateFaqInput = {
  question: string;
  answer: string;
  audience?: FaqAudience;
  publishStatus?: PublishStatus;
  order?: number;
};

export type UpdateFaqInput = Partial<CreateFaqInput>;

export type AdminFaqSortBy =
  | "question"
  | "audience"
  | "publishStatus"
  | "order"
  | "createdAt"
  | "updatedAt";

export type ListAdminFaqQuery = ListQuery<AdminFaqSortBy> & {
  publishStatus?: ListQueryFilter<PublishStatus>;
  audience?: ListQueryFilter<FaqAudience>;
};
