import type { ButtonProps } from "@heroui/react/button";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachPopularItemProps = Omit<
  ButtonProps,
  | "children"
  | "variant"
  | "isIconOnly"
  | "size"
  | "fullWidth"
  | "title"
  | "className"
> & {
  /** Rank number shown in the leading badge (1–n). */
  rank: number;
  /** Avatar image. */
  image: MediaImageSource;
  /** Accessible alt for the avatar. */
  imageAlt?: string;
  /** Coach display name. */
  title: ReactNode;
  /** Years-of-experience label (e.g. "5 YOE"). */
  experienceLabel?: ReactNode;
  /** Star rating value. */
  rating?: number;
  /** Review count. */
  ratingCount?: number;
  /** Extra classes for the root pressable. */
  className?: string;
};
