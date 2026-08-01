import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const statsCardVariants = tv({
  slots: {
    root: [
      "flex h-[190px] w-[150px] flex-col justify-between",
      "overflow-hidden rounded-[32px] p-4 text-start",
    ].join(" "),
    header: "flex items-center justify-between gap-2",
    title: "min-w-0 truncate leading-none",
    icon: "shrink-0 opacity-95 [&_svg]:block",
    chart: "h-[72px] w-full shrink-0",
    bars: "flex h-full w-full items-end justify-between",
    bar: "w-[11px] min-h-[11px] rounded-full",
    footer: "flex items-baseline gap-0.5 leading-none",
    value: "text-[28px] leading-none tracking-tight",
    unit: "text-[15px] leading-none opacity-95",
  },
});

export type StatsCardVariantProps = VariantProps<typeof statsCardVariants>;
