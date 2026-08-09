import type { HTMLAttributes, ReactNode } from "react";

export type ReadingTimeCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "className"
> & {
  /** Upper label (e.g. `"READING TIME"`). */
  label: ReactNode;
  /** Primary reading-time value (e.g. `"~4 Minutes"`). */
  value: ReactNode;
  /** Optional icon override. Defaults to Clock. */
  icon?: ReactNode;
  /** Extra classes for the root. */
  className?: string;
};
