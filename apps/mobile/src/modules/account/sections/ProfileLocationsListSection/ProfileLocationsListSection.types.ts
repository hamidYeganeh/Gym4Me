import type { HTMLAttributes, ReactNode } from "react";
import type { FavouriteLocation } from "@repo/api";

export type ProfileLocationsListItemView = {
  item: FavouriteLocation;
  title: string;
  line: string;
  icon: ReactNode;
};

export type ProfileLocationsListSectionProps = HTMLAttributes<HTMLDivElement> & {
  items: ProfileLocationsListItemView[];
  loading: boolean;
  error: string | null;
  emptyLabel: string;
  emptyHint: string;
  retryLabel: string;
  onRetry: () => void;
  onSelect: (item: FavouriteLocation) => void;
};
