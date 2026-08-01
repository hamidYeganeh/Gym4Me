import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachMapCardProps = {
  /** Avatar image. */
  image: MediaImageSource;
  /** Accessible alt for the avatar. */
  imageAlt?: string;
  /** Coach display name. */
  title: ReactNode;
  /** Specialty label (e.g. "Cardio Expert"). */
  specialtyLabel?: ReactNode;
  /** Optional specialty icon (defaults to Heart). */
  specialtyIcon?: ReactNode;
  /** Star rating value. */
  rating?: number;
  /** Review count. */
  ratingCount?: number;
  /** Address / gym line. */
  address?: ReactNode;
  /** "Get Direction" link label. */
  getDirectionsLabel?: ReactNode;
  /** Called when "Get Direction" is pressed. */
  onGetDirections?: ButtonProps["onPress"];
  /** Primary CTA label. */
  viewDetailsLabel?: ReactNode;
  /** Called when "View Details" is pressed. */
  onViewDetails?: ButtonProps["onPress"];
  /** Extra classes for the root card. */
  className?: string;
};
