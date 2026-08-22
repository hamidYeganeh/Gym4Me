import type { Club } from "@repo/api";

export type ClubReviewsTableSectionProps = {
  items: Club[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onReview: (row: Club) => void;
  className?: string;
};
