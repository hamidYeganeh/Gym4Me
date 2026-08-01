import type { ButtonProps, CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type SocialMediaItem = {
  /** Stable key for the list item. */
  key: string;
  /** Accessible label for the pressable item. */
  label: string;
  /** Centered brand / platform icon. */
  icon: ReactNode;
  /** Called when the item is pressed. */
  onPress?: ButtonProps["onPress"];
};

export type SocialMediaCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /** Header label. Defaults to `"SHARE THIS ON"`. */
  title?: ReactNode;
  /**
   * Platforms to render. Defaults to Facebook, Instagram, and LinkedIn when
   * omitted — wire presses via `onFacebook` / `onInstagram` / `onLinkedIn`.
   */
  items?: SocialMediaItem[];
  /** Accessible label for the default Facebook item. */
  facebookLabel?: string;
  /** Accessible label for the default Instagram item. */
  instagramLabel?: string;
  /** Accessible label for the default LinkedIn item. */
  linkedinLabel?: string;
  /** Called when the default Facebook item is pressed. */
  onFacebook?: ButtonProps["onPress"];
  /** Called when the default Instagram item is pressed. */
  onInstagram?: ButtonProps["onPress"];
  /** Called when the default LinkedIn item is pressed. */
  onLinkedIn?: ButtonProps["onPress"];
  /** Optional custom share affordance in the header (defaults to Share2). */
  shareIcon?: ReactNode;
  /** Extra classes for the root card. */
  className?: string;
};
