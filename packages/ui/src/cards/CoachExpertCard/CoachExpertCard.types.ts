import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachExpertCardProps = Omit<
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
  /** Coach display name. */
  title: ReactNode;
  /** Whether to show the verified badge. */
  isVerified?: boolean;
  /** Accessible label for the verified badge. */
  verifiedLabel?: string;
  /** Extra classes for the root pressable. */
  className?: string;
};
