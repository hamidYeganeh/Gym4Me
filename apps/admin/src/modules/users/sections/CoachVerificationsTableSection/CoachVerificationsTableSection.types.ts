import type { CoachVerificationItem } from "@repo/api";

export type CoachVerificationsTableSectionProps = {
  items: CoachVerificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onReview: (row: CoachVerificationItem) => void;
  className?: string;
};

export function coachUserLabel(item: CoachVerificationItem) {
  const user = item.user;
  if (!user) return item.userId;
  const name = [user.name?.first, user.name?.last].filter(Boolean).join(" ");
  return name || user.phone || user.code || item.userId;
}
