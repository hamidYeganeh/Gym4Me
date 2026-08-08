import type {
  FaqAudience,
  Role,
  SupportMessageAuthorKind,
  SupportRelatedEntityKind,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "../types";

export type SupportUserSummary = {
  id: string;
  phone?: string | null;
  name?: { first?: string | null; last?: string | null } | null;
};

export type SupportRelatedEntity = {
  kind: SupportRelatedEntityKind;
  id: string;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  requester: {
    user: SupportUserSummary | string | null;
    role: Role;
  };
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: string;
  relatedEntity: SupportRelatedEntity | null;
  assignment: {
    admin: SupportUserSummary | string | null;
    assignedAt: string;
  } | null;
  resolution: {
    note: string | null;
    resolvedBy: SupportUserSummary | string | null;
    resolvedAt: string;
  } | null;
  lastMessageAt: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketMessage = {
  id: string;
  ticketId: string;
  author: {
    user: SupportUserSummary | string | null;
    kind: SupportMessageAuthorKind;
  };
  body: string;
  attachments: string[];
  createdAt: string;
};

export type SupportTicketDetail = SupportTicket & {
  messages: SupportTicketMessage[];
};

export type CreateSupportTicketInput = {
  category: SupportTicketCategory;
  subject: string;
  body: string;
  attachments?: string[];
  relatedEntity?: SupportRelatedEntity;
};

export type ReplySupportTicketInput = {
  body: string;
  attachments?: string[];
};

export type ListMySupportTicketsQuery = {
  page?: number;
  page_size?: number;
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
};

export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
  audience: FaqAudience;
  order: number;
};

export type ListPublicFaqQuery = {
  audience?: FaqAudience;
};

export type SupportContact = {
  phone: string | null;
  email: string | null;
  telegram: string | null;
  workingHours: string | null;
};
