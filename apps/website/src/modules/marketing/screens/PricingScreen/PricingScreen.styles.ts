import { tv } from "tailwind-variants";

export const pricingScreenVariants = tv({
  slots: {
    root: "min-h-[70dvh] bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
    container: "mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-10 sm:gap-12",
    header: "mx-auto max-w-3xl space-y-4 text-center",
    eyebrow: "text-sm font-semibold text-accent",
    title:
      "text-3xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl",
    description: "leading-8 text-muted",
  },
});
