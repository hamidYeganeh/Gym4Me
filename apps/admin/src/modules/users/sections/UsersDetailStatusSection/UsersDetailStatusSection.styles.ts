import { tv } from "tailwind-variants";

export const usersDetailStatusSectionVariants = tv({
  slots: {
    root: "grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10",
    aside: "min-w-0",
    titleRow: "flex items-center gap-2",
    title: "text-base font-bold text-foreground",
    helpIcon: "text-muted",
    description: "mt-2 text-sm leading-6 text-muted",
    card: "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6",
    switchRow: "flex items-start gap-4",
    switchCopy: "flex min-w-0 flex-col gap-1",
    switchLabel: "text-sm font-semibold text-foreground",
    switchHint: "text-sm text-muted",
  },
});
