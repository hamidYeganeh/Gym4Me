import type { VerificationStatus } from "@repo/api";

export type CoachVerificationsHeaderSectionProps = {
  statusFilter: VerificationStatus | "all";
  onStatusChange: (value: VerificationStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};
