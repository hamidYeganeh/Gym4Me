import type { ButtonProps } from "@heroui/react/button";
import type { CardProps } from "@heroui/react/card";
import type { ReactNode } from "react";

export type ReviewCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Reviewer avatar image URL. */
  avatar?: string;
  /** Accessible alt for the avatar. */
  avatarAlt?: string;
  /** Initials shown when the avatar image is missing or fails. */
  avatarFallback?: string;
  /** Review date label (e.g. `"Jun 3, 2025"`). */
  date?: ReactNode;
  /** Review headline. */
  title: ReactNode;
  /** Review body copy. */
  content: ReactNode;
  /** Star rating value (e.g. `4.5`). */
  rating: number;
  /** Max stars shown (default `5`). */
  maxRating?: number;
  /** Whether to show the verified badge. */
  isVerified?: boolean;
  /** Verified badge label. Defaults to `"Verified Review"`. */
  verifiedLabel?: ReactNode;
  /** Like action label. Defaults to `"Like"`. */
  likeLabel?: ReactNode;
  /** Dislike action label. Defaults to `"Dislike"`. */
  dislikeLabel?: ReactNode;
  /** Report action label. Defaults to `"Report"`. */
  reportLabel?: ReactNode;
  /** Called when Like is pressed. */
  onLike?: ButtonProps["onPress"];
  /** Called when Dislike is pressed. */
  onDislike?: ButtonProps["onPress"];
  /** Called when Report is pressed. */
  onReport?: ButtonProps["onPress"];
  /** Extra classes for the root card. */
  className?: string;
};
