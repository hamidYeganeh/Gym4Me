import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";

export type ClubGalleryCardMediaKind = "video" | "image" | "document";

export type ClubGalleryCardProps = Omit<
  ButtonProps,
  "children" | "variant" | "isIconOnly" | "fullWidth" | "className" | "size"
> & {
  /** Thumbnail / cover image URL. */
  image: string;
  imageAlt?: string;
  title: ReactNode;
  /** Creator / uploader label shown under the title. */
  author?: ReactNode;
  /** Formatted view count (e.g. "5.5k"). */
  viewsLabel?: ReactNode;
  /** Media duration for videos (e.g. "01:40"). */
  durationLabel?: ReactNode;
  /** Kind of media — drives center overlay icon. */
  mediaKind?: ClubGalleryCardMediaKind;
  /** Shows the orange “New” badge on the thumbnail. */
  isNew?: boolean;
  /** Localized “New” badge label. */
  newLabel?: ReactNode;
  /** Accessible label for opening the item. */
  actionLabel: string;
  className?: string;
};
