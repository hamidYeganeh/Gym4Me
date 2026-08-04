import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubEquipmentCardVariants = tv({
  slots: {
    root: [
      "flex border-0 bg-surface-secondary shadow-none",
      "text-surface-foreground",
    ].join(" "),
    iconBadge: [
      "flex size-9 shrink-0 items-center justify-center",
      "rounded-xl bg-surface text-foreground",
    ].join(" "),
    icon: "size-5 shrink-0",
    body: "flex min-w-0",
    header: "gap-0.5 p-0",
    title: "text-sm leading-tight tracking-tight text-foreground",
    subtitle: "text-xs leading-tight text-muted",
    meta: "text-xs leading-tight text-muted/80",
  },
  variants: {
    orientation: {
      vertical: {
        root: "h-[148px] w-[144px] flex-col justify-between rounded-[24px] p-3",
        body: "flex-col gap-0.5",
      },
      horizontal: {
        root: "h-auto min-h-20 w-full flex-row items-center gap-4 rounded-[24px] p-4",
        iconBadge: "size-12 rounded-2xl [&_svg]:size-6",
        icon: "size-6",
        body: "flex-1 flex-row items-center justify-between gap-4",
        header: "gap-1",
        title: "text-base font-medium",
        subtitle: "text-sm",
        meta: "shrink-0 text-base font-medium text-foreground",
      },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export type ClubEquipmentCardVariantProps = VariantProps<
  typeof clubEquipmentCardVariants
>;
