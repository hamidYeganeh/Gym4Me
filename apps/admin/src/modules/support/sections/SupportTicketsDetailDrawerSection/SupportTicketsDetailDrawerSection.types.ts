import type { SupportTicketDetail, SupportTicketPriority } from "@repo/api";

export type SupportTicketsDetailDrawerSectionProps = {
  detail: SupportTicketDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  replyBody: string;
  onReplyBodyChange: (value: string) => void;
  actionPending: boolean;
  actionError: string | null;
  onOpenChange: (open: boolean) => void;
  onReply: () => void;
  onPriority: (priority: SupportTicketPriority) => void;
  onAssign: () => void;
  onResolveOpen: () => void;
  onClose: () => void;
};
