import { tv } from "tailwind-variants";

export const clubDetailScreenVariants = tv({
  slots: {
    content: "mx-auto flex w-full max-w-[960px] flex-col gap-6",
    header: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
    title:
      "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
    subtitle: "mt-1 text-sm text-muted",
    actions: "flex flex-wrap items-center gap-2",
    card: "rounded-2xl border border-border bg-surface p-5",
    cardTitle: "mb-3 text-base font-semibold text-foreground",
    grid: "grid gap-3 text-sm sm:grid-cols-2",
    label: "text-muted",
    value: "font-medium text-foreground",
    chips: "flex flex-wrap gap-1.5",
    message: "text-sm text-success",
    error: "text-sm text-danger",
    muted: "text-sm text-muted",
  },
});
