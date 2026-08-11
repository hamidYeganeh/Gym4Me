import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

export const discoveryCoachesDetailExperienceSectionVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    sectionTitle: "text-muted",
    card: [
      "gap-5 overflow-hidden rounded-[1.75rem] border border-border/60",
      "bg-default p-5 shadow-none",
    ].join(" "),
    summary: "leading-relaxed text-muted",
    timeline: "relative flex flex-col gap-6 ps-0.5",
    item: "relative flex gap-3.5",
    rail: [
      "absolute start-[0.4375rem] top-[1.125rem] bottom-[-1.5rem] w-0.5",
      "bg-accent",
    ].join(" "),
    railTrail: [
      "absolute start-[0.4375rem] top-[1.125rem] h-7 w-0.5",
      "bg-border",
    ].join(" "),
    marker: [
      "relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center",
      "rounded-full bg-accent",
    ].join(" "),
    markerCurrent: "ring-[6px] ring-accent/20",
    markerDot: "size-1.5 rounded-full bg-default",
    body: "min-w-0 flex-1 pt-0.5",
    year: "text-[0.7rem] font-bold tracking-wide text-muted",
    title: "mt-0.5 text-foreground",
    description: "mt-1 leading-snug text-muted",
  },
});

export type DiscoveryCoachesDetailExperienceSectionVariants = VariantProps<
  typeof discoveryCoachesDetailExperienceSectionVariants
>;
