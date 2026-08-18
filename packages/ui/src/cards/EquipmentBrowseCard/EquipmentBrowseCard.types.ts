import type { ButtonProps } from "@heroui/react/button";
import type { ReactNode } from "react";
import type { EquipmentBrowseCardVariantProps } from "./EquipmentBrowseCard.styles";

export type EquipmentBrowseCardSize = NonNullable<
  EquipmentBrowseCardVariantProps["size"]
>;

export type EquipmentBrowseCardProps = Omit<
  ButtonProps,
  "children" | "variant" | "className"
> & {
  /** Equipment display name overlaid on the image. */
  title: ReactNode;
  /** Background / product image. */
  image: string;
  imageAlt?: string;
  /** Chip width emphasis in a wrapping flex row. */
  size?: EquipmentBrowseCardSize;
  /** Extra classes for the root pressable (string only for `tv` slots). */
  className?: string;
};
