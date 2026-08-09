import type { ToggleButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { BodyTypeGender, BodyTypeKind } from "./art";

export type { BodyTypeGender, BodyTypeKind };

export type BodyTypeCardProps = Omit<
  ToggleButtonProps,
  "children" | "variant" | "isIconOnly" | "size" | "className"
> & {
  /**
   * Built-in somatotype illustration.
   * Ignored when `image` is provided.
   */
  bodyType?: BodyTypeKind;
  /**
   * Anatomy art gender.
   * @default "male"
   */
  gender?: BodyTypeGender;
  /**
   * Custom illustration — a URL string or React node.
   * Takes precedence over `bodyType`.
   */
  image?: string | ReactNode;
  /** Accessible label for the toggle (e.g. body type name). */
  actionLabel: string;
  /** Extra classes for the root toggle. */
  className?: string;
  /** Extra classes for the illustration layer. */
  imageClassName?: string;
};
