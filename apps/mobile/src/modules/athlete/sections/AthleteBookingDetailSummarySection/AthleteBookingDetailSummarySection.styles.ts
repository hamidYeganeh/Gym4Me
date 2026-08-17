import { tv } from "tailwind-variants";

export const athleteBookingDetailSummarySectionVariants = tv({
  slots: {
    hero: "flex flex-col items-center gap-3 rounded-[24px] border-0 bg-surface px-6 py-8 text-center",
    heroTitle: "text-foreground",
    heroClub: "text-muted",
    section: "flex flex-col gap-2",
    sectionTitle: "px-1 text-muted",
    detailsCard: "overflow-hidden rounded-[24px] border-0 bg-surface",
    detailRow: "flex items-center justify-between gap-3 px-4 py-3.5",
    detailLabel: "text-muted",
    detailValue: "text-foreground text-end",
    divider: "mx-4 h-px bg-border",
    checkInCard:
      "flex flex-col items-center gap-3 rounded-[24px] border border-accent/30 bg-accent/10 px-6 py-7 text-center",
    checkInTitle: "text-foreground",
    checkInCode:
      "text-4xl font-bold tracking-[0.4em] text-accent [direction:ltr]",
    checkInHint: "text-muted",
  },
});
