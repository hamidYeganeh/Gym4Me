import type { ButtonProps } from "@heroui/react";
import type { HTMLAttributes, ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachFeatureCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Portrait cover image. */
  image: MediaImageSource;
  /** Accessible alt for the portrait. */
  imageAlt?: string;
  /** Coach display name. */
  title: ReactNode;
  /** Specialty line under the name. */
  specialty?: ReactNode;
  /** Star rating value (e.g. `3.5`). */
  rating?: number;
  /** Max stars shown (default `5`). */
  maxRating?: number;
  /** Review count shown next to the score. */
  ratingCount?: number;
  /** Whether to show the "New" badge. */
  isNew?: boolean;
  /** Label for the new badge. */
  newLabel?: ReactNode;
  /** Accessible label for the close control. */
  closeLabel?: string;
  /** Called when close is pressed. */
  onClose?: ButtonProps["onPress"];
  /** Certified label (e.g. "Certified"). */
  certifiedLabel?: ReactNode;
  /** Years-of-experience label (e.g. "5 YOE"). */
  experienceLabel?: ReactNode;
  /** Extra classes for the cover image. */
  imageClassName?: string;
};
