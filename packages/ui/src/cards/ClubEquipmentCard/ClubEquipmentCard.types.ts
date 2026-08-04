import type { CardProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { ClubEquipmentCardVariantProps } from "./ClubEquipmentCard.styles";

export type ClubEquipmentCardOrientation = NonNullable<
  ClubEquipmentCardVariantProps["orientation"]
>;

export type ClubEquipmentCardProps = Omit<
  CardProps,
  "children" | "title" | "variant"
> & {
  /**
   * Layout direction.
   * - `vertical` — compact tile for carousels (default)
   * - `horizontal` — full-width row for sheets / lists
   */
  orientation?: ClubEquipmentCardOrientation;
  /** Equipment name (e.g. "تردمیل"). */
  title: ReactNode;
  /** Model / supporting line (e.g. "مدل پرو ایکس"). */
  subtitle?: ReactNode;
  /** Quantity or other meta (e.g. "۴ عدد"). */
  meta?: ReactNode;
  /** Icon shown in the top-start badge. Defaults to Treadmill. */
  icon?: ReactNode;
};
