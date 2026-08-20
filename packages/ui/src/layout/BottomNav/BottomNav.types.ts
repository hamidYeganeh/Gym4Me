import type { ReactNode } from "react";
import type { ButtonProps } from "@heroui/react/button";

export type BottomNavHoldMenuOption = {
  key: string;
  label: string;
  icon: ReactNode;
  onPress?: ButtonProps["onPress"];
};

export type BottomNavItemHoldMenu = {
  /** Accessible name for the hold menu dialog. */
  label?: string;
  options: BottomNavHoldMenuOption[];
};

export type BottomNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  isActive?: boolean;
  href?: string;
  onPress?: ButtonProps["onPress"];
  /** Long-press opens a compact menu (e.g. profile role switcher). */
  holdMenu?: BottomNavItemHoldMenu;
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
  /**
   * Portal to `document.body` so `position: fixed` stays viewport-pinned
   * when ancestors use transforms/overflow (page transitions). Off for inline demos.
   */
  portal?: boolean;
  /** Controlled open state for the center actions menu. */
  isActionsOpen?: boolean;
  onActionsOpenChange?: (isOpen: boolean) => void;
};
