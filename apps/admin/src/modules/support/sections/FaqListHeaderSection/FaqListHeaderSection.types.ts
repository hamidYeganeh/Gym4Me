import type { FaqAudience, PublishStatus } from "@repo/api";

export type FaqListHeaderSectionProps = {
  statusFilter: PublishStatus | "all";
  audienceFilter: FaqAudience | "any";
  onStatusChange: (value: PublishStatus | "all") => void;
  onAudienceChange: (value: FaqAudience | "any") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
