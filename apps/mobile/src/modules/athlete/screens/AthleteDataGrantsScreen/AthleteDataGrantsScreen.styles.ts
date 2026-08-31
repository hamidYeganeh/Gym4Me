import { tv } from "tailwind-variants";

export const athleteDataGrantsScreenVariants = tv({
  slots: {
    root: "min-h-dvh bg-background",
    content: "flex flex-col gap-6 px-4 pb-28 pt-4",
    intro: "flex flex-col gap-2",
    subtitle: "text-muted",
    card: "flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4",
    form: "flex flex-col gap-3",
    nativeSelect:
      "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-accent",
    scopes: "flex flex-col gap-2",
    scopeRow: "flex items-center gap-2 text-sm text-foreground",
    list: "flex flex-col gap-3",
    grantRow:
      "flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3",
    grantTop: "flex items-start justify-between gap-2",
    meta: "text-muted",
    empty: "border border-dashed border-border text-center text-muted",
    feedback: "rounded-xl bg-success/10 px-3 py-2 text-sm text-success",
    error: "rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger",
  },
});
