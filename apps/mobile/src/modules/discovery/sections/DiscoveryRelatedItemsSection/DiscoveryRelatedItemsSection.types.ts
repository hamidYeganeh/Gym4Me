export type DiscoveryRelatedItem = {
  id: string;
  label: string;
};

export type DiscoveryRelatedItemsSectionProps = {
  title: string;
  hint?: string;
  ariaLabel?: string;
  items: DiscoveryRelatedItem[];
  onItemPress?: (id: string) => void;
  previousLabel?: string;
  nextLabel?: string;
  /** Show prev/next controls when there is more than one item. Default true. */
  showNavigation?: boolean;
  className?: string;
};
