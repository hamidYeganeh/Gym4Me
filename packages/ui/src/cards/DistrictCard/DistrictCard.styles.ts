import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const districtCardVariants = tv({
  slots: {
    root: [
      "relative flex flex-col justify-end overflow-hidden",
      "bg-surface-tertiary text-stats-foreground",
      "transition-transform duration-fast ease-app",
      "outline-none data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    media: "absolute inset-0 overflow-hidden",
    image:
      "pointer-events-none absolute inset-0 size-full object-cover select-none",
    scrim: [
      "pointer-events-none absolute inset-0",
      "bg-linear-to-t from-foreground/75 via-foreground/25 to-transparent",
    ].join(" "),
    footer: "relative z-10 mt-auto flex w-full min-w-0 flex-col items-start p-0",
    title: "leading-tight tracking-tight text-stats-foreground",
    subtitle: "leading-tight text-stats-foreground/90",
    pressTarget: [
      "absolute inset-0 z-20 h-auto min-h-full w-full min-w-full",
      "rounded-[inherit] border-0 bg-transparent shadow-none",
      "hover:bg-transparent data-[hovered=true]:bg-transparent",
      "pressed:bg-transparent data-[pressed=true]:bg-transparent",
    ].join(" "),
  },
  variants: {
    size: {
      sm: {
        root: "h-[180px] w-[132px] rounded-[20px] p-3",
        footer: "gap-0.5",
        title: "text-base font-bold",
        subtitle: "text-xs font-normal",
      },
      md: {
        root: "h-[220px] w-[160px] rounded-[24px] p-3.5",
        footer: "gap-0.5",
        title: "text-xl font-bold",
        subtitle: "text-sm font-normal",
      },
      lg: {
        root: "h-[280px] w-[200px] rounded-[28px] p-4",
        footer: "gap-1",
        title: "text-2xl font-bold",
        subtitle: "text-base font-normal",
      },
    },
    pressable: {
      true: {
        root: "cursor-pointer",
      },
      false: {},
    },
  },
  defaultVariants: {
    size: "md",
    pressable: false,
  },
});

export type DistrictCardVariantProps = VariantProps<typeof districtCardVariants>;
