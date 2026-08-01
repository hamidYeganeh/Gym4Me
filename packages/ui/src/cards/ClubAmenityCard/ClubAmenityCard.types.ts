import type { CardProps } from "@heroui/react";
import type { ReactNode } from "react";

export type ClubAmenityCardProps = Omit<
  CardProps,
  "children" | "title" | "variant"
> & {
  /** Amenity name (e.g. "Tailored Fitness Guidance"). */
  title: ReactNode;
  /** Optional supporting line under the title. */
  subtitle?: ReactNode;
  /** Icon shown in the end badge. Defaults to BookOpen. */
  icon?: ReactNode;
};
