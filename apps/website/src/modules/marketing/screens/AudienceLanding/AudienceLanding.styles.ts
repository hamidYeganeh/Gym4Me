import { tv } from "tailwind-variants";

export const audienceLandingVariants = tv({
  slots: {
    root: "bg-background px-6 py-16 text-foreground",
    container: "mx-auto flex w-full max-w-[1440px] flex-col gap-16",
    header: "max-w-4xl space-y-6",
    eyebrow: "text-sm font-semibold text-accent",
    title: "text-4xl font-bold leading-tight tracking-tight sm:text-6xl",
    description: "max-w-3xl text-lg leading-9 text-muted",
    actions: "flex flex-wrap gap-3",
    primaryCta:
      "rounded-2xl bg-accent px-6 py-3 font-semibold text-accent-foreground",
    secondaryCta: "rounded-2xl border border-border px-6 py-3 font-semibold",
    capabilitiesSection: "space-y-6",
    sectionTitle: "text-2xl font-bold",
    capabilitiesGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    capabilityCard: "rounded-3xl border border-border bg-surface p-6",
    capabilityTitle: "font-semibold",
    capabilityBody: "mt-3 text-sm leading-7 text-muted",
    outcomesSection: "rounded-[2rem] bg-default p-8 sm:p-10",
    outcomesGrid: "mt-6 grid gap-3 md:grid-cols-2",
    outcomeItem: "rounded-2xl bg-surface px-5 py-4",
  },
});
