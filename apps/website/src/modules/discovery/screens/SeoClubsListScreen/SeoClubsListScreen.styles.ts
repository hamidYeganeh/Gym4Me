import { tv } from "tailwind-variants";

export const seoClubsListScreenVariants = tv({
  slots: {
    root: "min-h-[70vh] bg-background px-6 py-14 text-foreground",
    container: "mx-auto flex max-w-6xl flex-col gap-8",
    header: "max-w-3xl space-y-3",
    eyebrow: "text-sm font-medium text-accent",
    title: "text-3xl font-bold tracking-tight sm:text-5xl",
    description: "leading-8 text-muted",
    searchForm: "flex max-w-2xl gap-2",
    searchInput:
      "min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3",
    searchButton:
      "rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-foreground",
    grid: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    card: "rounded-3xl border border-border bg-surface p-5",
    cardLink: "block space-y-4",
    cardHeader: "flex items-start justify-between gap-3",
    cardTitle: "text-xl font-semibold",
    rating: "rounded-full bg-default px-3 py-1 text-xs",
    cardBody: "line-clamp-2 text-sm leading-7 text-muted",
    cardMeta: "text-xs text-muted",
    empty: "rounded-3xl border border-border p-8 text-muted",
  },
});
