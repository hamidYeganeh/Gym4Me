import type { KycRequestStatus } from "@repo/api";

export type KycListHeaderSectionProps = {
  statusFilter: KycRequestStatus | "all";
  onStatusChange: (value: KycRequestStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};
