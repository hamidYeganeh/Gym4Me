import type { ButtonProps } from "@heroui/react";
import type { CSSProperties, ReactNode } from "react";

export type SportCategoryCardSize = "sm" | "md" | "lg";

/** Category data rendered by SportCategoryCard. */
export type SportCategory = {
  /** Larger bold title (e.g. "Support & Help"). */
  title: ReactNode;
  /** Smaller top line above the title (e.g. "Category"). */
  subtitle: ReactNode;
  /**
   * Optional background image — a URL string or a custom React node
   * (e.g. `next/image`).
   */
  backgroundImage?: string | ReactNode;
  /** Optional category icon. Falls back to PersonKarate. */
  icon?: ReactNode;
};

export type SportCategoryCardProps = Omit<
  ButtonProps,
  | "children"
  | "variant"
  | "isIconOnly"
  | "size"
  | "fullWidth"
  | "className"
  | "style"
> & {
  /** Category content (title, subtitle, background image, icon). */
  category: SportCategory;
  /** Card size. Defaults to `md` (280×190). */
  size?: SportCategoryCardSize;
  /** Accessible label for the pressable card. */
  actionLabel: string;
  /**
   * Card background color. Also used as the image overlay tint when
   * `category.backgroundImage` is set. Defaults to `#2563EB`.
   */
  color?: string;
  /** Text and icon color. Defaults to `#FFFFFF`. */
  foregroundColor?: string;
  /** Circular affordance background. Defaults to `#000000`. */
  actionColor?: string;
  /** Circular affordance icon color. Defaults to `foregroundColor`. */
  actionForegroundColor?: string;
  /** Extra classes for the background image layer. */
  backgroundImageClassName?: string;
  /**
   * Overlay opacity over the background image (0–1). Uses `color` as the
   * tint. Defaults to `0.55` when an image is present, otherwise unused.
   */
  overlayOpacity?: number;
  /** Extra classes for the circular affordance. */
  actionClassName?: string;
  /** Extra classes for the root pressable. */
  className?: string;
  /** Extra inline styles merged onto the root. */
  style?: CSSProperties;
};
