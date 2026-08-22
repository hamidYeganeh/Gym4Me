import type { AdminDataTablePagination } from "@/shared/components/AdminDataTable";

export type AdminListPaginationSummary = {
  from: number;
  to: number;
  total: number;
};

export function adminListPaginationSummary(
  page: number,
  pageSize: number,
  total: number,
): AdminListPaginationSummary {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return { from, to, total };
}

export function adminListPaginationProps(input: {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
}): AdminDataTablePagination {
  return {
    page: input.page,
    totalPages: input.totalPages,
    previousLabel: input.previousLabel,
    nextLabel: input.nextLabel,
    onPageChange: input.onPageChange,
  };
}
