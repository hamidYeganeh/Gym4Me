import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachMapCardProps = {
  /** Avatar image. */
  image: MediaImageSource;
  /** Accessible alt for the avatar. */
  imageAlt?: string;
  /** Coach / club display name. */
  title: ReactNode;
  /** Specialty label (e.g. "HIIT Expert"). */
  specialtyLabel?: ReactNode;
  /** Optional specialty icon (defaults to Heart). */
  specialtyIcon?: ReactNode;
  /** Distance label (e.g. "500m"). */
  distanceLabel?: ReactNode;
  /** Star rating value. */
  rating?: number;
  /** Max stars rendered (default 5). */
  maxRating?: number;
  /** Review count. */
  ratingCount?: number;
  /** Address / gym line. */
  address?: ReactNode;
  /** Show verified badge on the avatar. */
  verified?: boolean;
  /** Accessible label for the verified badge. */
  verifiedLabel?: string;
  /** "Get Direction" button label. */
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
