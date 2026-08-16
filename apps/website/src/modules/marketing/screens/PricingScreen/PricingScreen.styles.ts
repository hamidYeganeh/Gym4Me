import { tv } from "tailwind-variants";

export const pricingScreenVariants = tv({
  slots: {
    root: "min-h-[70vh] bg-background px-6 py-16 text-foreground",
    container: "mx-auto flex w-full max-w-[1440px] flex-col gap-12",
    header: "mx-auto max-w-3xl space-y-4 text-center",
    eyebrow: "text-sm font-semibold text-accent",
    title: "text-4xl font-bold tracking-tight sm:text-6xl",
    description: "leading-8 text-muted",
  },
});
