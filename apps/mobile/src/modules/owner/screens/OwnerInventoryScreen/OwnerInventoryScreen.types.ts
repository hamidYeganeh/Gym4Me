import type { OwnerInventoryItem } from "../../lib/owner-inventory-data";

export type OwnerInventoryCreateForm = {
  name: string;
  quantity: number;
  locationLabel: string;
};

export type OwnerInventoryScreenProps = {
  items: OwnerInventoryItem[];
  pendingId?: string | null;
  onConditionChange?: (
    item: OwnerInventoryItem,
    condition: OwnerInventoryItem["condition"],
  ) => void;
  onCreate?: (form: OwnerInventoryCreateForm) => Promise<void>;
  className?: string;
};
