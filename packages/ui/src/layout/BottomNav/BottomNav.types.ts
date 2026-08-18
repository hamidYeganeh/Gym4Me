import type { ReactNode } from "react";
import type { ButtonProps } from "@heroui/react/button";

export type BottomNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  isActive?: boolean;
  href?: string;
  onPress?: ButtonProps["onPress"];
};

/** Role-specific (or any) quick action shown in the center menu grid. */
export type BottomNavQuickAction = {
  key: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onPress?: ButtonProps["onPress"];
};

export type BottomNavCenterAction = {
  label: string;
  icon?: ReactNode;
  /** Used when `actions` is empty — plain center press. */
  onPress?: ButtonProps["onPress"];
  /**
   * Quick actions for the popup grid above the center button.
   * Consumers pass different lists per user role.
   */
  actions?: BottomNavQuickAction[];
  /** Accessible name for the quick-actions dialog. */
  actionsLabel?: string;
};

export type BottomNavProps = {
  items: BottomNavItem[];
  centerAction?: BottomNavCenterAction;
  "aria-label"?: string;
  className?: string;
  /** Controlled open state for the center actions menu. */
  isActionsOpen?: boolean;
  onActionsOpenChange?: (isOpen: boolean) => void;
};
