import { tv } from "tailwind-variants";

export const discoveryCoachesReservePaymentStepSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    summaryCard:
      "flex flex-col gap-3 rounded-[1.25rem] border-0 bg-surface-secondary p-4",
    summaryRow: "flex items-center justify-between gap-3",
    summaryLabel: "text-muted",
    summaryValue: "text-foreground",
    summaryTotalRow: "border-t border-separator pt-3",
    summaryTotalValue: "text-foreground",
    couponRow: "flex items-end gap-2",
    couponField: "flex-1",
    couponApply: "shrink-0",
    methodCard:
      "flex items-center justify-between gap-3 rounded-2xl border border-accent bg-accent/5 p-4",
    methodBody: "flex min-w-0 flex-col gap-0.5",
    methodTitle: "text-foreground",
    methodHint: "text-muted",
    methodCheck: "text-accent",
    errorText: "text-danger",
  },
});
