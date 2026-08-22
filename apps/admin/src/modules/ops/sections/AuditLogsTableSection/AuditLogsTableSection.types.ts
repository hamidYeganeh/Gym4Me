import type { AuditLogItem } from "@repo/api";

export type AuditLogsTableSectionProps = {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  className?: string;
};
