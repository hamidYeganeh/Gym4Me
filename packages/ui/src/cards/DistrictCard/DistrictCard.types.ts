import type { ButtonProps, CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type DistrictCardSize = "sm" | "md" | "lg";

export type DistrictCardProps = Omit<
  CardProps,
  "children" | "variant" | "className" | "title"
> & {
  /**
   * Cover image — a URL string or a custom React node (e.g. `next/image`).
   */
  image: string | ReactNode;
  /** Accessible alt text when `image` is a URL string. */
  imageAlt?: string;
  /** Primary label (e.g. `"Los Angeles"`). */
  title: ReactNode;
  /** Secondary label under the title (e.g. `"California"`). */
  subtitle?: ReactNode;
  /**
   * Card size.
   * - `sm` — compact (`132×180`)
   * - `md` — default (`160×220`)
   * - `lg` — large (`200×280`)
   */
  size?: DistrictCardSize;
  /**
   * Accessible label when the card is pressable.
   * Defaults to a stringified `title` when `onPress` is set.
   */
  actionLabel?: string;
  /** Called when the card is pressed. */
  onPress?: ButtonProps["onPress"];
  /** Extra classes for the cover image layer. */
  imageClassName?: string;
  /** Extra classes for the root card. */
  className?: string;
};
