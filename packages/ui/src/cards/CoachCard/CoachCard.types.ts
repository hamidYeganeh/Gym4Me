import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type CoachCardVariant = "compact" | "default";

export type CoachCardAuthor = {
  name: ReactNode;
  avatarSrc?: string | null;
  avatarAlt?: string;
};

export type CoachCardStat = {
  label: ReactNode;
  icon?: ReactNode;
};

export type CoachCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /**
   * Size preset.
   * - `compact` — 260×280
   * - `default` — 276×367
   */
  variant?: CoachCardVariant;
  /** Full-bleed cover image. */
  image: MediaImageSource;
  /** Accessible alt for the cover image. */
  imageAlt?: string;
  /** Top-start pill label (e.g. specialty). */
  badge?: ReactNode;
  /** Coach or card title. */
  title: ReactNode;
  /** Single supporting line under the title. Ignored when `meta` is set. */
  subtitle?: ReactNode;
  /** Bullet-separated supporting line (e.g. `["Yoga", "5 years"]`). */
  meta?: ReactNode[];
  /** Star rating value (e.g. `3.5`). */
  rating?: number;
  /** Max stars shown (default `5`). */
  maxRating?: number;
  /** Review count shown next to the score. */
  ratingCount?: number;
  /** Icon + label row under the rating (compact footer). */
  stats?: CoachCardStat[];
  /** Avatar + name row at the bottom. */
  author?: CoachCardAuthor;
  /** Accessible label for the top-end action. */
  actionLabel?: string;
  /** Optional icon inside the top-end circular action. */
  actionIcon?: ReactNode;
  /** Called when the top-end action is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Press handler for the card (navigation). */
  onPress?: ButtonProps["onPress"];
  /** Extra classes for the cover image. */
  imageClassName?: string;
};
