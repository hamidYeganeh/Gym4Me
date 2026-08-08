import type { ReactNode } from "react";
import type { PublicUser } from "@repo/api";

export type UsersListTableSectionProps = {
  items: PublicUser[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onView: (userId: string) => void;
  toolbar?: ReactNode;
  className?: string;
};
