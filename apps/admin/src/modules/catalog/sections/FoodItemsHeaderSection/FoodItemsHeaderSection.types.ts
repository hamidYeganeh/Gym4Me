import type { FoodItemStatus } from "@repo/api";

export type FoodItemsHeaderSectionProps = {
  statusFilter: FoodItemStatus | "all";
  onStatusChange: (value: FoodItemStatus | "all") => void;
  onCreate: () => void;
  onRefresh: () => void;
  className?: string;
};
