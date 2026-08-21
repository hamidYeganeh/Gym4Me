import type { IconProps } from "@repo/icons/create-icon";
import type { ComponentType, HTMLAttributes } from "react";

export type DisclosureCardIcon = ComponentType<IconProps>;

export type DisclosureCardItem = {
  id: string;
  name: string;
  price: number;
  icon: DisclosureCardIcon;
};

export type DisclosureCardCollection = {
  id: string;
  name: string;
  items: DisclosureCardItem[];
};

export type DisclosureCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Grouped collections shown as expandable cards. */
  collections: DisclosureCardCollection[];
  /** Formats the collapsed “N items” subtitle. */
  formatItemsCount?: (count: number) => string;
  /** Formats item price in the expanded list. */
  formatPrice?: (price: number) => string;
  /** Called when an expanded row is pressed. */
  onItemPress?: (item: DisclosureCardItem, collection: DisclosureCardCollection) => void;
};
