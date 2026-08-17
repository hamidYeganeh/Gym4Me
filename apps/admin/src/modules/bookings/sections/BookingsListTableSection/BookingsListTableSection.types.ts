import type { Booking } from "@repo/api";

export type BookingsListTableSectionProps = {
  items: Booking[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onCancel: (row: Booking) => void;
  onRefund: (row: Booking) => void;
  className?: string;
};

export type BookingTableMeta = {
  actionsClassName: string;
  onCancel: (row: Booking) => void;
  onRefund: (row: Booking) => void;
};
