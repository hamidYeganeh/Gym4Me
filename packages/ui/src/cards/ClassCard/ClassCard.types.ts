import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type ClassCardVariant = "dark" | "light";

export type ClassCardAuthor = {
  name: ReactNode;
  avatarSrc?: string | null;
  avatarAlt?: string;
};

export type ClassCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /**
   * Visual treatment.
   * - `dark` — full-bleed photo with a dark bottom scrim and light type
   * - `light` — photo fading into a white panel with dark type
   */
  variant?: ClassCardVariant;
  /** Full-bleed cover image. */
  image: MediaImageSource;
  /** Accessible alt for the cover image. */
  imageAlt?: string;
  /** Top-start pill label (e.g. category). */
  badge: ReactNode;
  /** Class title. */
  title: ReactNode;
  /** Instructor avatar + name. */
  author: ClassCardAuthor;
  /** Calories value (e.g. `100`). */
  kcal: ReactNode;
  /** Duration value (e.g. `100`). */
  minutes: ReactNode;
  /** Score value (e.g. `100`). */
  score: ReactNode;
  /** Calories unit label. Defaults to `"kcal"`. */
  kcalLabel?: ReactNode;
  /** Duration unit label. Defaults to `"minutes"`. */
  minutesLabel?: ReactNode;
  /** Score unit label. Defaults to `"score"`. */
  scoreLabel?: ReactNode;
  /** Override the calories icon. Defaults to Fire1. */
  kcalIcon?: ReactNode;
  /** Override the duration icon. Defaults to Clock. */
  minutesIcon?: ReactNode;
  /** Override the score icon. Defaults to StarFull. */
  scoreIcon?: ReactNode;
  /** Accessible label for the top-end action. */
  actionLabel?: string;
  /** Optional icon inside the top-end circular action. Defaults to ShapeCircle. */
  actionIcon?: ReactNode;
  /** Called when the top-end action is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Press handler for the card (navigation). */
  onPress?: ButtonProps["onPress"];
  /** Extra classes for the cover image. */
  imageClassName?: string;
};
