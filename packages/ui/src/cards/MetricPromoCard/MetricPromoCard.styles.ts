import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const metricPromoCardVariants = tv({
  slots: {
    root: [
      "relative flex h-[132px] w-full items-stretch overflow-hidden",
      "rounded-[28px] border border-warning",
      "bg-warning/10 text-start",
    ].join(" "),
    content: "relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 pe-2",
    title: "max-w-[11.5rem] text-[17px] leading-snug tracking-tight text-foreground",
    action: [
      "inline-flex h-auto min-h-0 w-fit items-center gap-1 rounded-md !px-0 !py-0",
      "text-[15px] font-bold text-warning shadow-none",
      "hover:bg-transparent hover:opacity-90",
      "pressed:bg-transparent data-[pressed=true]:bg-transparent",
      "data-[pressed=true]:scale-[0.98]",
    ].join(" "),
    actionIcon: "size-4 shrink-0 text-current",
    media: "pointer-events-none relative w-[46%] shrink-0 self-stretch overflow-hidden",
    image: [
      "pointer-events-none absolute inset-0 size-full select-none",
      "object-cover object-[70%_40%]",
      // Bleed past the card edge for depth
      "scale-110",
    ].join(" "),
  },
});

export type MetricPromoCardVariantProps = VariantProps<
  typeof metricPromoCardVariants
>;
