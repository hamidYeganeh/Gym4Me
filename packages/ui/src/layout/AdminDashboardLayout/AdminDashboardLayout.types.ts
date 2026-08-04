import type { ReactNode } from "react";

export type AdminDashboardNavId =
  | "home"
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

export type AdminDashboardLabels = {
  greeting: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filtersAriaLabel: string;
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
  className?: string;
};
