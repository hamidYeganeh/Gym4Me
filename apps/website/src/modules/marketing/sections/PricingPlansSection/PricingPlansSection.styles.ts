import { tv } from "tailwind-variants";

export const pricingPlansSectionVariants = tv({
  slots: {
    grid: "grid gap-5 lg:grid-cols-3",
    plan: "flex flex-col rounded-[2rem] border border-border bg-surface p-7",
    planTitle: "text-2xl font-bold",
    planDescription: "mt-3 min-h-14 text-sm leading-7 text-muted",
    planPrice: "mt-7 text-3xl font-bold",
    planPeriod: "mt-1 text-xs text-muted",
    featureList: "my-7 flex-1 space-y-3 text-sm",
    planCta:
      "rounded-2xl bg-accent px-5 py-3 text-center font-semibold text-accent-foreground",
  },
});
