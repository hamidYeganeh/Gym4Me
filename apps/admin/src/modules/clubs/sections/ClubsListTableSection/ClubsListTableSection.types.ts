import type { ReactNode } from "react";
import type { Club } from "@repo/api";
import type { AdminDataTableSort } from "@/shared/components/AdminDataTable";

export type ClubsListTableSectionProps = {
  items: Club[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  sort?: AdminDataTableSort;
  onSortChange: (sort: AdminDataTableSort) => void;
  onView: (clubId: string) => void;
  toolbar?: ReactNode;
  className?: string;
};
