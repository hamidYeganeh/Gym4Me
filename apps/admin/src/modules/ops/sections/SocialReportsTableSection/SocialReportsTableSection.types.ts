import type { SocialReport } from "@repo/api";

export type SocialReportsTableSectionProps = {
  items: SocialReport[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onResolve: (row: SocialReport, resolution: "resolved" | "rejected") => void;
  className?: string;
};

export type ReportTableMeta = {
  actionsClassName: string;
  onResolve: (row: SocialReport, resolution: "resolved" | "rejected") => void;
};
