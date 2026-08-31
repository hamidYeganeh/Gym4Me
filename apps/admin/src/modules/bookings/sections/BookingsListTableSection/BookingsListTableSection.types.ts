import type { Booking } from "@repo/api";

export type BookingsListTableSectionProps = {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onView: (row: Booking) => void;
  onCancel: (row: Booking) => void;
  onRefund: (row: Booking) => void;
  className?: string;
};

export type BookingTableMeta = {
  actionsClassName: string;
  onView: (row: Booking) => void;
  onCancel: (row: Booking) => void;
  onRefund: (row: Booking) => void;
};
