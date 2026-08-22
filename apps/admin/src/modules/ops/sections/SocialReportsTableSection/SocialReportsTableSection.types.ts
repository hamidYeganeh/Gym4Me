import type { SocialReport } from "@repo/api";

export type SocialReportsTableSectionProps = {
  items: SocialReport[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onResolve: (row: SocialReport, resolution: "resolved" | "rejected") => void;
  className?: string;
};

export type ReportTableMeta = {
  actionsClassName: string;
  onResolve: (row: SocialReport, resolution: "resolved" | "rejected") => void;
};
