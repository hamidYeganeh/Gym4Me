import type { ButtonProps } from "@heroui/react/button";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type ClubOwnerCardProps = Omit<
  ButtonProps,
  | "children"
  | "variant"
  | "isIconOnly"
  | "size"
  | "fullWidth"
  | "title"
  | "className"
> & {
  /** Avatar image. */
  image: MediaImageSource;
  /** Accessible alt for the avatar. */
  imageAlt?: string;
  /** Owner display name. */
  title: ReactNode;
  /** Optional rank badge overlaid on the avatar (e.g. 1). */
  rank?: number | string;
  /** Years-of-experience label (e.g. "5 YOE"). */
  experienceLabel?: ReactNode;
  /** Star rating value. */
  rating?: number;
  /** Review count shown next to the rating. */
  ratingCount?: number;
  /** Accessible label for opening owner details. */
  actionLabel: string;
  className?: string;
};
