export type CollectionGridDisclosureItem = {
  id: string;
  name: string;
  iconName?: string | null;
  detail?: string;
};

export type CollectionGridDisclosureCollection = {
  id: string;
  name: string;
  items: CollectionGridDisclosureItem[];
  countLabel: string;
  emptyLabel?: string;
  expandLabel: string;
  collapseLabel: string;
};

export type CollectionGridDisclosureProps = {
  collections: CollectionGridDisclosureCollection[];
  className?: string;
};
