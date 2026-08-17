import type { SocialReportStatus } from "@repo/api";

export type SocialReportsHeaderSectionProps = {
  statusFilter: SocialReportStatus | "all";
  onStatusChange: (value: SocialReportStatus | "all") => void;
  onRefresh: () => void;
  className?: string;
};

export const SOCIAL_REPORT_STATUS_FILTERS: Array<SocialReportStatus | "all"> = [
  "all",
  "open",
  "resolved",
  "rejected",
];
