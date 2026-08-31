import type { IconProps } from "@repo/icons/create-icon";
import type { ComponentType, HTMLAttributes } from "react";

export type DisclosureCardIcon = ComponentType<IconProps>;

export type DisclosureCardItem = {
  id: string;
  name: string;
  /**
   * Icon component, or a PascalCase `@repo/icons` catalog name
   * (e.g. `"WifiFull"`) loaded lazily.
   */
  icon: DisclosureCardIcon | string;
  /** Secondary line under the name (quantity, description, …). */
  detail?: string;
  /** Optional amount; used when `detail` is omitted. */
  price?: number;
};

export type DisclosureCardCollection = {
  id: string;
  name: string;
  items: DisclosureCardItem[];
  /** Shown in the expanded body when `items` is empty. */
  emptyLabel?: string;
};

export type DisclosureCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Grouped collections shown as expandable cards. */
  collections: DisclosureCardCollection[];
  /** Formats the collapsed “N items” subtitle. */
  formatItemsCount?: (count: number) => string;
  /** Formats item price in the expanded list when `detail` is omitted. */
  formatPrice?: (price: number) => string;
  /** Accessible label for the expanded-state close control. */
  closeLabel?: string;
  /** Called when an expanded row is pressed. */
  onItemPress?: (
    item: DisclosureCardItem,
    collection: DisclosureCardCollection,
  ) => void;
};
