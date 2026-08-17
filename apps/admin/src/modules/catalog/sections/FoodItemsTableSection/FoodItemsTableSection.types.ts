import type { FoodItem } from "@repo/api";

export type FoodItemsTableSectionProps = {
  items: FoodItem[];
  total: number;
  loading: boolean;
  fetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
  className?: string;
};

export type FoodTableMeta = {
  actionsClassName: string;
  onEdit: (row: FoodItem) => void;
  onArchive: (row: FoodItem) => void;
};
