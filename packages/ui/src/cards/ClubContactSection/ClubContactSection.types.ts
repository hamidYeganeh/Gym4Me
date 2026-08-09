import type { ComponentProps } from "react";
import type { ReactNode } from "react";

export type ClubContactPhone = {
  /** Unique key for list rendering. */
  id: string;
  /** Display phone number (may include localized digits / separators). */
  number: string;
  /** Department / role label above the number. */
  label: ReactNode;
  /** Accessible label for the call action. */
  callLabel: string;
};

export type ClubContactSectionProps = Omit<
  ComponentProps<"section">,
  "children" | "title"
> & {
  /** Section heading (e.g. "تلفن‌ها"). */
  title: ReactNode;
  /** Contact phone rows. */
  phones: readonly ClubContactPhone[];
  /** Called when a row’s call button is pressed. */
  onCall?: (phone: ClubContactPhone) => void;
  className?: string;
};
