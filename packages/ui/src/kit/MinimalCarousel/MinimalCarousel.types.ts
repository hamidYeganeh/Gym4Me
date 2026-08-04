import type { ComponentType, HTMLAttributes } from "react";

export type MinimalCarouselIcon = ComponentType<{
  size?: number | string;
  className?: string;
}>;

export type MinimalCarouselCard = {
  id: string;
  title: string;
  value: string;
  /** CSS color value (theme token preferred, e.g. `statsColors.orange`). */
  color: string;
  icon: MinimalCarouselIcon;
};

export type MinimalCarouselProps = {
  cards: MinimalCarouselCard[];
  copyLabel: string;
  editLabel: string;
  onCopyClick?: (card: MinimalCarouselCard) => void;
  onCustomizeClick?: (card: MinimalCarouselCard) => void;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;
