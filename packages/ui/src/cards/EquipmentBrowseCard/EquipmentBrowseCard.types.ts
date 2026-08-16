import type { ButtonProps } from "@heroui/react";
import type { ReactNode } from "react";
import type { EquipmentBrowseCardVariantProps } from "./EquipmentBrowseCard.styles";

export type EquipmentBrowseCardSize = NonNullable<
  EquipmentBrowseCardVariantProps["size"]
>;

export type EquipmentBrowseCardProps = Omit<
  ButtonProps,
  "children" | "variant"
> & {
  /** Equipment display name overlaid on the image. */
  title: ReactNode;
  /** Background / product image. */
  image: string;
  imageAlt?: string;
  /** Chip width emphasis in a wrapping flex row. */
  size?: EquipmentBrowseCardSize;
};
