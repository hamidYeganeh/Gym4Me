import type { Club } from "@repo/api";

export type ClubReviewsTableSectionProps = {
  items: Club[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onReview: (row: Club) => void;
  className?: string;
};
