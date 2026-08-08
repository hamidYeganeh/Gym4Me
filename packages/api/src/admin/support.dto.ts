import type {
  FaqAudience,
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

export type ListAdminSupportTicketsQuery = {
  page?: number;
  page_size?: number;
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  search?: string;
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

export type ListAdminFaqQuery = {
  page?: number;
  page_size?: number;
  publishStatus?: PublishStatus;
  audience?: FaqAudience;
  search?: string;
};
