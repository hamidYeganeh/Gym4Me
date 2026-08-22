import type { KycRequestKind, KycRequestStatus } from "@repo/api";

export type KycListHeaderSectionProps = {
  statusFilter: KycRequestStatus | "all";
  kindFilter: KycRequestKind | "all";
  onStatusChange: (value: KycRequestStatus | "all") => void;
  onKindChange: (value: KycRequestKind | "all") => void;
  onRefresh: () => void;
  className?: string;
};
