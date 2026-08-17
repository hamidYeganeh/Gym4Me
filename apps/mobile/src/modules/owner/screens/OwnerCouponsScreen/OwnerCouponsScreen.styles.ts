import { tv } from "tailwind-variants";

export const ownerCouponsScreenVariants = tv({
  slots: {
    root: "min-h-dvh bg-background",
    content: "mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-28 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-foreground",
    introSubtitle: "text-muted",
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    card: "overflow-hidden rounded-[24px] border-0 bg-surface",
    row: "flex items-start justify-between gap-3 px-4 py-3.5",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowHint: "text-muted",
    divider: "mx-4 h-px bg-border",
    formCard: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    select: "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm",
    empty: "rounded-2xl border border-dashed border-border px-4 py-8 text-center text-muted",
  },
});
