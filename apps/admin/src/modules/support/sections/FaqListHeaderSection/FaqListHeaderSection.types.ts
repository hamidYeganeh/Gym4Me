import type { PublishStatus } from "@repo/api";

export type FaqListHeaderSectionProps = {
  statusFilter: PublishStatus | "all";
  onStatusChange: (value: PublishStatus | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
