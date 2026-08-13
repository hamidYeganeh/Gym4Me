import type { ReactNode } from "react";

export type AdminDashboardNavId =
  | "home"
  | "users"
  | "clubs"
  | "bookings"
  | "finance"
  | "catalogs"
  | "ops"
  | "locations"
  | "sports"
  | "choices"
  | "refs"
  | "articles"
  | "banners"
  | "gamification"
  | "support"
  | "calendar"
  | "profile"
  | "settings"
  | "analytics"
  | "logout";

export type AdminDashboardNavItem = {
  id: AdminDashboardNavId;
  label: string;
  icon: ReactNode;
};

export type AdminDashboardBreadcrumb = {
  label: string;
  onPress?: () => void;
};

export type AdminDashboardLabels = {
  greeting: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filtersAriaLabel: string;
  breadcrumbsAriaLabel: string;
  navAriaLabel: string;
  themeToLight: string;
  themeToDark: string;
  avatarAlt: string;
  nav: Record<AdminDashboardNavId, string>;
};

export type AdminDashboardLayoutProps = {
  children?: ReactNode;
  labels: AdminDashboardLabels;
  activeNavId?: AdminDashboardNavId;
  onNavPress?: (id: AdminDashboardNavId) => void;
  onLogoPress?: () => void;
  onFilterPress?: () => void;
  onAvatarPress?: () => void;
  avatarSrc?: string;
  notificationCount?: number;
  breadcrumbs?: AdminDashboardBreadcrumb[];
  /** Replaces the default greeting + search header content. */
  header?: ReactNode;
  className?: string;
};
