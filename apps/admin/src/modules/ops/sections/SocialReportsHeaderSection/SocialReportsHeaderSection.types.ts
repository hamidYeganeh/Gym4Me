import type { SocialReportStatus } from "@repo/api";

export type SocialReportsHeaderSectionProps = {
  statusFilter: SocialReportStatus | "all";
  onStatusChange: (value: SocialReportStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};
