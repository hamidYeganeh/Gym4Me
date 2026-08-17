import type { StartImpersonationResult } from "@repo/api";

export type AuditLogsImpersonationDrawerSectionProps = {
  isOpen: boolean;
  session: StartImpersonationResult | null;
  targetUserId: string;
  reason: string;
  pending: boolean;
  copied: boolean;
  actionError: string | null;
  onOpenChange: (open: boolean) => void;
  onTargetUserIdChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onStart: () => void;
  onEnd: () => void;
  onCopy: () => void;
};
