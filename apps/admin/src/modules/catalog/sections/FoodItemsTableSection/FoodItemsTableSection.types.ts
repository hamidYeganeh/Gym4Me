import type { FoodItem } from "@repo/api";

export type FoodItemsTableSectionProps = {
  items: FoodItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  categoryLabels?: Record<string, string>;
  onPageChange: (page: number) => void;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
  className?: string;
};

export type FoodTableMeta = {
  actionsClassName: string;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
};
