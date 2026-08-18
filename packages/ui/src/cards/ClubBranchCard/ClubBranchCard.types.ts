import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";

export type ClubBranchCardSize = "sm" | "md" | "lg";

export type ClubBranchCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /**
   * Cover image — a URL string or a custom React node (e.g. `next/image`).
   */
  image: string | ReactNode;
  /** Accessible alt text when `image` is a URL string. */
  imageAlt?: string;
  /** Primary vertical label (e.g. `"Commercial"`). */
  title: ReactNode;
  /** Secondary vertical label beside the title (e.g. `"Design"`). */
  subtitle?: ReactNode;
  /** Card size. Defaults to `md`. */
  size?: ClubBranchCardSize;
  /** Accessible label for the branch action. */
  actionLabel: string;
  /** Called when the circular action is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the cover image layer. */
  imageClassName?: string;
  /** Extra classes for the circular action button. */
  actionClassName?: string;
};
