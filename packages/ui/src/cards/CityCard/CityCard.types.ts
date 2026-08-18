import type { ButtonProps } from "@heroui/react/button";
import type { HTMLAttributes, ReactNode } from "react";

export type CityCardSize = "sm" | "md" | "lg";

export type CityCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> & {
  /**
   * Cover image — a URL string or a custom React node (e.g. `next/image`).
   */
  image: string | ReactNode;
  /** Accessible alt text when `image` is a URL string. */
  imageAlt?: string;
  /** City name shown at the top (e.g. `"رامسر"`). */
  city: ReactNode;
  /**
   * Card size.
   * - `sm` — compact (`132×180`)
   * - `md` — default (`160×220`)
   * - `lg` — large (`200×280`)
   */
  size?: CityCardSize;
  /** Full-width CTA label (e.g. `"مشاهده باشگاه ها"`). */
  actionLabel: string;
  /** Called when the CTA is pressed. */
  onAction?: ButtonProps["onPress"];
  /** Extra classes for the cover image layer. */
  imageClassName?: string;
  /** Extra classes for the CTA button. */
  actionClassName?: string;
};
