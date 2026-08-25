import { tv } from "tailwind-variants";

export const seoClassesListScreenVariants = tv({
  slots: {
    root: "min-h-[70dvh] bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
    container: "mx-auto flex w-full min-w-0 max-w-[1440px] flex-col gap-6 sm:gap-8",
    header: "max-w-3xl space-y-3",
    eyebrow: "text-sm font-medium text-accent",
    title: "text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl",
    description: "leading-8 text-muted",
    searchForm: "flex max-w-2xl flex-col gap-2 sm:flex-row",
    searchInput: "min-h-11 min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-base",
    searchButton: "min-h-11 rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-foreground sm:w-auto",
    grid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    card: "rounded-3xl border border-border bg-surface p-5",
    cardLink: "block space-y-4",
    cardTitle: "text-xl font-semibold",
    cardBody: "line-clamp-3 text-sm leading-7 text-muted",
    cardMeta: "text-xs font-medium text-accent",
    empty: "rounded-3xl border border-border p-6 text-muted sm:p-8",
  },
});
