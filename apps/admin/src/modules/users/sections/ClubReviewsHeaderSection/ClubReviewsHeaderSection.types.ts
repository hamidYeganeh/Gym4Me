import type { ClubLifecycleStatus } from "@repo/api";

export type ClubReviewsHeaderSectionProps = {
  statusFilter: ClubLifecycleStatus | "all";
  onStatusChange: (value: ClubLifecycleStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};
