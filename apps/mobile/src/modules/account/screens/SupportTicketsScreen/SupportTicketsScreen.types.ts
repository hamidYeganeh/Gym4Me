import type { HTMLAttributes } from "react";
import type { SupportTicket } from "@repo/api";

export type SupportTicketsScreenProps = HTMLAttributes<HTMLDivElement> & {
  roleSegment?: "athlete" | "coach" | "owner";
  tickets: SupportTicket[];
  loading?: boolean;
  creating?: boolean;
  error?: string | null;
  onCreate?: (input: {
    subject: string;
    body: string;
  }) => Promise<void> | void;
};
