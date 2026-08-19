import { tv } from "tailwind-variants";

export const audienceLandingScreenVariants = tv({
  slots: {
    root: "bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
    container: "mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-12 sm:gap-16",
    header: "max-w-4xl space-y-5 sm:space-y-6",
    eyebrow: "text-sm font-semibold text-accent",
    title:
      "text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl",
    description: "max-w-3xl text-base leading-8 text-muted sm:text-lg sm:leading-9",
    actions: "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
    primaryCta:
      "inline-flex min-h-12 items-center justify-center rounded-2xl bg-accent px-6 py-3 text-center font-semibold text-accent-foreground",
    secondaryCta:
      "inline-flex min-h-12 items-center justify-center rounded-2xl border border-border px-6 py-3 text-center font-semibold",
    capabilitiesSection: "space-y-6",
    sectionTitle: "text-2xl font-bold",
    capabilitiesGrid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    capabilityCard: "rounded-3xl border border-border bg-surface p-5 sm:p-6",
    capabilityTitle: "font-semibold",
    capabilityBody: "mt-3 text-sm leading-7 text-muted",
    outcomesSection: "rounded-[2rem] bg-default p-6 sm:p-10",
    outcomesGrid: "mt-6 grid gap-3 sm:grid-cols-2",
    outcomeItem: "rounded-2xl bg-surface px-4 py-4 sm:px-5",
  },
});
