import type { ReactNode } from "react";
import type { Club } from "@repo/api";

export type ClubsListTableSectionProps = {
  items: Club[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onView: (clubId: string) => void;
  toolbar?: ReactNode;
  className?: string;
};
