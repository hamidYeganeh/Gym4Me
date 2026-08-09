import type { HTMLAttributes, ReactNode } from "react";

export type ClubLocationStatKey = "distance" | "score" | "students";

export type ClubLocationStat = {
  key: ClubLocationStatKey;
  value: ReactNode;
  label: ReactNode;
};

export type ClubLocationOpenStatus = "open" | "closed";

export type ClubLocationCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Whether the club is currently open or closed. */
  status?: ClubLocationOpenStatus;
  /** Label for the status chip (e.g. `"باز است"` / `"بسته است"`). */
  statusLabel?: ReactNode;
  /** Operating hours shown beside the status chip (e.g. `"۰۶:۰۰ - ۲۳:۰۰"`). */
  hoursLabel?: ReactNode;
  /**
   * Location stats shown in the card body.
   * Typical order: distance → score → students.
   */
  stats: readonly ClubLocationStat[];
};
