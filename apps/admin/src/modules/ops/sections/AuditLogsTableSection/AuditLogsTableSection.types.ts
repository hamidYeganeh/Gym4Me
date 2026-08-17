import type { AuditLogItem } from "@repo/api";

export type AuditLogsTableSectionProps = {
  items: AuditLogItem[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  className?: string;
};
