import type { AdminKycRequest } from "@repo/api";

export type KycListTableSectionProps = {
  items: AdminKycRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onReview: (row: AdminKycRequest) => void;
  className?: string;
};
