import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachNearbyAvailability = "remote" | "in-person";

export type CoachNearbyCardProps = Omit<
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
  /** Price range line (e.g. "$100 - $250/session"). */
  priceLabel?: ReactNode;
  /** Specialty chip label (e.g. "HIIT Expert"). */
  specialtyLabel?: ReactNode;
  /** Optional specialty icon. */
  specialtyIcon?: ReactNode;
  /** Distance chip label (e.g. "500m"). */
  distanceLabel?: ReactNode;
  /** Star rating value. */
  rating?: number;
  /** Max stars shown (default `5`). */
  maxRating?: number;
  /** Review count. */
  ratingCount?: number;
  /** Availability mode. */
  availability?: CoachNearbyAvailability;
  /** Label for remote availability. */
  remoteLabel?: ReactNode;
  /** Label for in-person-only availability. */
  inPersonLabel?: ReactNode;
  /** Extra classes for the root pressable. */
  className?: string;
};
