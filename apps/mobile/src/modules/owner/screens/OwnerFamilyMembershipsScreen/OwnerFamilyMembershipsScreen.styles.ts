import { tv } from "tailwind-variants";

export const ownerFamilyMembershipsScreenVariants = tv({
  slots: {
    root: "min-h-dvh bg-background",
    content: "mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pb-28 pt-2",
    intro: "flex flex-col gap-1",
    introTitle: "text-foreground",
    introSubtitle: "text-muted",
    section: "flex flex-col gap-3",
    sectionTitle: "text-foreground",
    card: "flex flex-col gap-3 rounded-[24px] border-0 bg-surface p-4",
    row: "flex items-start justify-between gap-3",
    rowBody: "flex min-w-0 flex-1 flex-col gap-0.5",
    rowLabel: "text-foreground",
    rowHint: "text-muted",
    slots: "flex flex-wrap gap-2",
    empty: "rounded-2xl border border-dashed border-border px-4 py-8 text-center text-muted",
  },
});
