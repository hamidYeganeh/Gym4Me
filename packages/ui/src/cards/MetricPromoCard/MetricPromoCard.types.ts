import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";
import type { MediaImageSource } from "../../common/MediaImage";

export type MetricPromoCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /** Bold headline (e.g. "See your health metric insights"). */
  title: ReactNode;
  /** CTA label (e.g. "See Insight"). */
  actionLabel: string;
  /** Lifestyle / equipment photo shown on the trailing edge. */
  image: MediaImageSource;
  /** Accessible alt for the promo image. Empty when decorative. */
  imageAlt?: string;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the CTA control. */
  actionClassName?: string;
  /** Extra classes for the image. */
  imageClassName?: string;
};
