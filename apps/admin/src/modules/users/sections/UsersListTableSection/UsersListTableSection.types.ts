import type { ReactNode } from "react";
import type { PublicUser } from "@repo/api";
import type { AdminDataTableSort } from "@/shared/components/AdminDataTable";

export type UsersListTableSectionProps = {
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  sort?: AdminDataTableSort;
  onSortChange: (sort: AdminDataTableSort) => void;
  onView: (userId: string) => void;
  toolbar?: ReactNode;
  className?: string;
};
