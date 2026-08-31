import type { ComponentPropsWithoutRef } from "react";

export type PopularLocationKind = "province" | "city" | "district";

export type PopularLocationCardProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onClick"
> & {
  image: string;
  imageAlt?: string;
  eyebrow: string;
  name: string;
  countLabel?: string;
  actionLabel?: string;
  onPress?: () => void;
};
