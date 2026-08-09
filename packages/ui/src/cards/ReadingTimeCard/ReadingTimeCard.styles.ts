import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const readingTimeCardVariants = tv({
  slots: {
    root: [
      "relative flex w-full flex-col gap-2.5",
      "rounded-[32px] bg-[var(--eclipse)] p-6",
      "text-start text-[var(--stats-foreground)]",
    ].join(" "),
    label: [
      "pe-12 text-sm font-medium uppercase tracking-wide",
      "text-[var(--stats-foreground)]",
    ].join(" "),
    value: [
      "pe-12 text-2xl font-bold leading-none tracking-tight",
      "text-[var(--stats-foreground)]",
    ].join(" "),
    icon: [
      "absolute end-6 top-6 flex size-10 shrink-0 items-center justify-center",
      "rounded-full bg-[color-mix(in_oklch,var(--snow)_18%,var(--eclipse))]",
      "text-[color-mix(in_oklch,var(--eclipse)_72%,var(--snow))]",
      "[&_svg]:block",
    ].join(" "),
  },
});

export type ReadingTimeCardVariantProps = VariantProps<
  typeof readingTimeCardVariants
>;
