import { tv } from "tailwind-variants";

export const athleteQrCheckInScreenVariants = tv({
  slots: {
    root: "bg-background",
    content: "flex flex-col gap-6 pb-10 pt-1",
    intro: "flex flex-col gap-2",
    introTitle: "tracking-tight text-foreground",
    introSubtitle: "text-muted",
    qrCard:
      "flex flex-col items-center gap-4 rounded-[1.5rem] border-0 bg-surface p-6 text-center",
    qrPlaceholder:
      "flex size-48 items-center justify-center rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 text-accent",
    code: "font-mono text-lg tracking-widest text-foreground",
    meta: "text-muted",
    list: "flex flex-col gap-3",
    row: "flex flex-col gap-1 rounded-[1.25rem] border-0 bg-surface px-4 py-3",
    rowTop: "flex items-center justify-between gap-2",
    actions: "flex flex-wrap gap-2",
  },
});
