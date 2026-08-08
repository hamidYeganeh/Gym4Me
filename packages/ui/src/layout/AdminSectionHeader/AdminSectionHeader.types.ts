import type { ReactNode } from "react";

export type AdminSectionHeaderTab = {
  id: string;
  label: string;
};

export type AdminSectionHeaderProps = {
  tabs?: AdminSectionHeaderTab[];
  activeTabId?: string;
  onTabPress?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filtersAriaLabel: string;
  onFilterPress?: () => void;
  className?: string;
  endContent?: ReactNode;
};
