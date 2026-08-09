import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const busyHoursCardVariants = tv({
  slots: {
    root: [
      "flex w-full flex-col justify-between gap-5",
      "rounded-[2.5rem] bg-accent p-6 text-accent-foreground",
      "text-start",
    ].join(" "),
    header: "flex items-center justify-between gap-3",
    title: "text-base font-medium leading-none text-accent-foreground",
    icon: "size-5 shrink-0 text-accent-foreground",
    chartBlock: "flex w-full flex-col gap-2",
    chart: "h-[5.5rem] w-full",
    chartSvg: "block h-full w-full overflow-visible",
    labels: "flex w-full items-center justify-between gap-1 px-0.5",
    label: [
      "min-w-0 flex-1 text-center text-[0.7rem] font-medium",
      "tabular-nums tracking-wide text-accent-foreground/70",
    ].join(" "),
    footer: "flex items-baseline gap-1.5 leading-none",
    value: [
      "text-[2.5rem] font-bold tracking-tight text-accent-foreground",
      "tabular-nums",
    ].join(" "),
    unit: "text-base font-medium text-accent-foreground/85",
  },
});

export type BusyHoursCardVariantProps = VariantProps<
  typeof busyHoursCardVariants
>;
