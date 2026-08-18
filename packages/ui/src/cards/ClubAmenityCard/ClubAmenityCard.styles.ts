import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const clubAmenityCardVariants = tv({
  slots: {
    root: [
      "flex h-[110px] w-fit min-w-[13.5rem] flex-row items-center justify-between gap-6",
      "rounded-[32px] border-0 bg-surface p-4 shadow-none",
      "text-surface-foreground",
    ].join(" "),
    body: "flex min-w-0 flex-col justify-center gap-1",
    header: "gap-1 p-0",
    title: "text-lg leading-tight font-bold tracking-tight text-foreground",
    subtitle: "text-sm leading-tight text-muted",
    iconBadge: [
      "flex size-[88px] shrink-0 items-center justify-center",
      "rounded-[22px] bg-surface-secondary text-foreground",
    ].join(" "),
    icon: "size-12 shrink-0",
  },
});

export type ClubAmenityCardVariantProps = VariantProps<
  typeof clubAmenityCardVariants
>;
