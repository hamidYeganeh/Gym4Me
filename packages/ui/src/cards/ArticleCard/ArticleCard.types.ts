import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export type ArticleCardVariant = "stacked" | "row" | "feed";

export type ArticleCardAuthor = {
  name: ReactNode;
  avatarSrc?: string | null;
};

export type ArticleCardProps = Omit<
  ButtonProps,
  "children" | "variant" | "isIconOnly" | "fullWidth" | "className" | "size"
> & {
  /**
   * Card layout:
   * - `stacked` — vertical cover card
   * - `row` — horizontal thumbnail card
   * - `feed` — text-first list card (relative time · category, title, views · likes)
   */
  variant?: ArticleCardVariant;
  /** Cover / thumbnail image URL (`stacked` / `row`). */
  coverSrc?: string | null;
  /** Primary category / tag label. */
  category: ReactNode;
  title: ReactNode;
  /** Absolute or relative date label. */
  publishedAtLabel?: ReactNode;
  /** Reading time label. */
  readingTimeLabel?: ReactNode;
  viewsLabel?: ReactNode;
  likesLabel?: ReactNode;
  commentsLabel?: ReactNode;
  /** Required for `stacked` / `row`; optional for `feed`. */
  author?: ArticleCardAuthor;
  saved?: boolean;
  saveLabel?: string;
  onSavePress?: () => void;
  actionLabel: string;
  className?: string;
};
