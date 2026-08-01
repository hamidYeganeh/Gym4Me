import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubEquipmentCardVariants = tv({
  slots: {
    root: [
      "flex h-[148px] w-[144px] flex-col justify-between",
      "rounded-[24px] border-0 bg-surface p-3 shadow-none",
      "text-surface-foreground",
    ].join(" "),
    iconBadge: [
      "flex size-9 shrink-0 items-center justify-center",
      "rounded-xl bg-surface-secondary text-foreground",
    ].join(" "),
    icon: "size-5 shrink-0",
    body: "flex min-w-0 flex-col gap-0.5",
    header: "gap-0.5 p-0",
    title: "text-sm leading-tight tracking-tight text-foreground",
    subtitle: "text-xs leading-tight text-muted",
    meta: "text-xs leading-tight text-muted/80",
  },
});

export type ClubEquipmentCardVariantProps = VariantProps<
  typeof clubEquipmentCardVariants
>;
