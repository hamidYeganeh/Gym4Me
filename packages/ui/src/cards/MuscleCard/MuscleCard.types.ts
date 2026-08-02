import type { ToggleButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { MuscleArtArea } from "./art";

/** Body areas with built-in anatomy art. */
export type MuscleBodyArea = MuscleArtArea;

export type MuscleCardProps = Omit<
  ToggleButtonProps,
  "children" | "variant" | "isIconOnly" | "size" | "className"
> & {
  /**
   * Built-in anatomy illustration (cropped body diagram).
   * Ignored when `image` is provided.
   */
  bodyArea?: MuscleBodyArea;
  /**
   * Custom illustration — a URL string or React node.
   * Takes precedence over `bodyArea`.
   */
  image?: string | ReactNode;
  /** Accessible label for the toggle (e.g. muscle / body area name). */
  actionLabel: string;
  /** Extra classes for the root toggle. */
  className?: string;
  /** Extra classes for the illustration layer. */
  imageClassName?: string;
};
