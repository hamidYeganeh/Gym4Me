import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type StickyBottomActionsProps = {
  children: ReactNode;
  /** Classes for the inner content row/stack. */
  contentClassName?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;
