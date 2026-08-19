export const articlesListScreenStyles = {
  root: "min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6 sm:py-14 lg:px-8 lg:py-16",
  container: "mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8",
  intro: "flex flex-col gap-3",
  title: "tracking-tight text-balance",
  subtitle: "max-w-2xl text-muted leading-7",
  filters: "flex flex-col gap-3",
  chips: "-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1",
  chip: "inline-flex min-h-10 items-center rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground",
  chipActive: "border-foreground bg-foreground text-background",
  list: "flex flex-col gap-4",
  empty: "text-muted",
} as const;
