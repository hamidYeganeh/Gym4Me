import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";

export type ArticleEditorialCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Category pill label (e.g. "تناسب اندام"). */
  category: ReactNode;
  /** Optional icon inside the category pill. */
  categoryIcon?: ReactNode;
  /** Jalali / localized date line. */
  dateLabel: ReactNode;
  title: ReactNode;
  author: ReactNode;
  readingTimeLabel: ReactNode;
  /** Accessible name for the card and action button. */
  actionLabel: string;
  onPress?: ButtonProps["onPress"];
};
