import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricReorderItemVariants = tv({
  slots: {
    root: [
      "flex w-full items-center gap-3 rounded-[22px] border border-border",
      "bg-surface px-3.5 py-3.5 text-start text-surface-foreground",
      "shadow-none outline-none",
      "data-[dragging=true]:border-accent/40 data-[dragging=true]:shadow-md",
      "data-[dragging=true]:scale-[1.02]",
    ].join(" "),
    remove: [
      "size-7 shrink-0 rounded-full !p-0",
      "bg-danger text-danger-foreground shadow-none",
      "hover:opacity-90 data-[pressed=true]:scale-[0.96]",
      "[&_svg]:size-3.5",
    ].join(" "),
    meta: "flex min-w-0 flex-1 items-center gap-3",
    icon: [
      "flex size-8 shrink-0 items-center justify-center text-muted",
      "[&_svg]:block [&_svg]:size-6 [&_svg]:text-current",
    ].join(" "),
    title: "truncate text-[17px] font-medium leading-none text-foreground",
    drag: [
      "inline-flex size-10 shrink-0 touch-none items-center justify-center",
      "rounded-lg !p-0 text-muted shadow-none",
      "hover:bg-transparent hover:text-foreground",
      "pressed:bg-transparent data-[pressed=true]:bg-transparent",
      "cursor-grab active:cursor-grabbing",
      "[&_svg]:size-5",
    ].join(" "),
  },
});

export type MetricReorderItemVariantProps = VariantProps<
  typeof metricReorderItemVariants
>;
